import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, AlertTriangle, CheckCircle2, RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const weatherIcons = {
  "clear": Sun,
  "sunny": Sun,
  "cloudy": Cloud,
  "partly cloudy": Cloud,
  "rain": CloudRain,
  "drizzle": CloudRain,
  "storm": CloudRain,
  "snow": CloudSnow,
  "windy": Wind,
};

function getWeatherIcon(condition = "") {
  const lower = condition.toLowerCase();
  for (const [key, Icon] of Object.entries(weatherIcons)) {
    if (lower.includes(key)) return Icon;
  }
  return Cloud;
}

function getAgriAlert(weather) {
  if (!weather) return null;
  const { temp, rain_probability, wind_speed, humidity, condition = "" } = weather;
  const lowerCond = condition.toLowerCase();

  if (lowerCond.includes("storm") || rain_probability > 80) {
    return { type: "danger", text: "⚠️ Condições adversas — evite plantio e aplicação de defensivos." };
  }
  if (rain_probability > 50) {
    return { type: "warning", text: "🌧️ Alta chance de chuva — atenção ao manejo e colheita." };
  }
  if (wind_speed > 20) {
    return { type: "warning", text: "💨 Vento forte — não aplique defensivos hoje." };
  }
  if (temp >= 20 && temp <= 32 && rain_probability < 30 && wind_speed < 15) {
    return { type: "ideal", text: "✅ Condições ideais para plantio e aplicação de insumos." };
  }
  if (temp > 35) {
    return { type: "warning", text: "🌡️ Temperatura elevada — reforce a irrigação." };
  }
  return { type: "ok", text: "🌤️ Condições aceitáveis para atividades de campo." };
}

export default function PrevisaoTempo({ lavouras }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Pick the first lavoura with a location
  const fazendaLocal = lavouras?.find(l => l.localizacao)?.localizacao || null;

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    const location = fazendaLocal || "Brasil";
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um serviço de previsão do tempo para agricultura. Retorne a previsão do tempo ATUAL para a localização: "${location}".
      Use dados reais e atuais (hoje ${new Date().toLocaleDateString("pt-BR")}).
      Responda apenas com o JSON, sem texto extra.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          location: { type: "string" },
          temp: { type: "number", description: "Temperatura atual em °C" },
          temp_min: { type: "number", description: "Temperatura mínima do dia em °C" },
          temp_max: { type: "number", description: "Temperatura máxima do dia em °C" },
          condition: { type: "string", description: "Condição ex: Ensolarado, Nublado, Chuva" },
          humidity: { type: "number", description: "Umidade relativa em %" },
          wind_speed: { type: "number", description: "Velocidade do vento em km/h" },
          rain_probability: { type: "number", description: "Probabilidade de chuva em %" },
          forecast: {
            type: "array",
            description: "Previsão para os próximos 3 dias",
            items: {
              type: "object",
              properties: {
                day: { type: "string" },
                condition: { type: "string" },
                temp_min: { type: "number" },
                temp_max: { type: "number" },
                rain_probability: { type: "number" }
              }
            }
          }
        }
      }
    });
    setWeather(result);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (lavouras !== undefined) fetchWeather();
  }, [fazendaLocal]);

  const alert = getAgriAlert(weather);
  const WeatherIcon = weather ? getWeatherIcon(weather.condition) : Cloud;

  const alertColors = {
    danger: "bg-destructive/10 border-destructive/30 text-destructive",
    warning: "bg-secondary/10 border-secondary/30 text-secondary-foreground",
    ideal: "bg-primary/10 border-primary/30 text-primary-foreground",
    ok: "bg-muted border-border text-muted-foreground",
  };

  return (
    <Card className="p-5 border-none shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Previsão do Tempo</h2>
          {fazendaLocal && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" /> {fazendaLocal}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={fetchWeather} disabled={loading} title="Atualizar">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-sm text-muted-foreground py-6">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive/50" />
          Não foi possível carregar a previsão.
        </div>
      )}

      {!loading && weather && (
        <div className="space-y-4">
          {/* Current */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <WeatherIcon className="w-12 h-12 text-secondary" />
              <div>
                <p className="text-3xl font-bold">{weather.temp}°C</p>
                <p className="text-sm text-muted-foreground">{weather.condition}</p>
                <p className="text-xs text-muted-foreground">{weather.temp_min}° / {weather.temp_max}°</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground text-right">
              <span className="flex items-center justify-end gap-1"><Droplets className="w-3 h-3" /> {weather.humidity}% umidade</span>
              <span className="flex items-center justify-end gap-1"><Wind className="w-3 h-3" /> {weather.wind_speed} km/h</span>
              <span className="flex items-center justify-end gap-1"><CloudRain className="w-3 h-3" /> {weather.rain_probability}% chuva</span>
            </div>
          </div>

          {/* Agri alert */}
          {alert && (
            <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${alertColors[alert.type]}`}>
              {alert.text}
            </div>
          )}

          {/* 3-day forecast */}
          {weather.forecast?.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {weather.forecast.slice(0, 3).map((day, i) => {
                const DayIcon = getWeatherIcon(day.condition);
                return (
                  <div key={i} className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{day.day}</p>
                    <DayIcon className="w-5 h-5 mx-auto text-secondary mb-1" />
                    <p className="text-xs font-semibold">{day.temp_min}° / {day.temp_max}°</p>
                    <p className="text-xs text-muted-foreground">{day.rain_probability}% 🌧</p>
                  </div>
                );
              })}
            </div>
          )}

          {lastUpdate && (
            <p className="text-xs text-muted-foreground text-right">
              Atualizado às {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}