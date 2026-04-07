import type { WeatherData } from "../types.js";
import { WEATHER_CODES } from "../types.js";

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

async function geocodeLocation(location: string): Promise<GeocodingResult> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json() as { results?: Array<{ name: string; latitude: number; longitude: number; country: string; admin1?: string }> };
  if (!data.results || data.results.length === 0) {
    throw new Error(`Location not found: "${location}"`);
  }
  const r = data.results[0];
  return {
    name: r.admin1 ? `${r.name}, ${r.admin1}, ${r.country}` : `${r.name}, ${r.country}`,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  };
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export async function getWeather(location: string): Promise<WeatherData> {
  const geo = await geocodeLocation(location);

  const params = new URLSearchParams({
    latitude: geo.latitude.toString(),
    longitude: geo.longitude.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "auto",
    forecast_days: "1",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API failed: ${res.status}`);
  const data = await res.json() as OpenMeteoResponse;

  return {
    location: geo.name,
    latitude: geo.latitude,
    longitude: geo.longitude,
    temperature: data.current.temperature_2m,
    temperatureUnit: "F",
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    weatherCode: data.current.weather_code,
    weatherDescription: WEATHER_CODES[data.current.weather_code] || "Unknown",
    dailyHigh: data.daily.temperature_2m_max[0],
    dailyLow: data.daily.temperature_2m_min[0],
    precipitationProbability: data.daily.precipitation_probability_max[0],
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
  };
}

export function formatWeatherResponse(weather: WeatherData): string {
  return [
    `Weather for ${weather.location}`,
    ``,
    `Current: ${weather.temperature}°${weather.temperatureUnit} (feels like ${weather.apparentTemperature}°${weather.temperatureUnit})`,
    `Conditions: ${weather.weatherDescription}`,
    `Humidity: ${weather.humidity}%`,
    `Wind: ${weather.windSpeed} mph`,
    ``,
    `Today's Range: ${weather.dailyLow}°${weather.temperatureUnit} — ${weather.dailyHigh}°${weather.temperatureUnit}`,
    `Precipitation: ${weather.precipitationProbability}% chance`,
    `Sunrise: ${weather.sunrise}`,
    `Sunset: ${weather.sunset}`,
  ].join("\n");
}
