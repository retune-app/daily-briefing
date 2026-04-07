export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  temperatureUnit: string;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
  dailyHigh: number;
  dailyLow: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
  query: string;
}

export interface CalendarEvent {
  title: string;
  time: string;
  duration: string;
  notes: string;
}

export interface CalendarResponse {
  date: string;
  dayOfWeek: string;
  events: CalendarEvent[];
  summary: string;
}

export const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};
