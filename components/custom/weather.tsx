import React from 'react';

interface WeatherData {
  success: boolean;
  location: string;
  current: {
    temperature: number;
    weatherDescription: string;
    icon: string;
    unit: string;
  };
  daily: Array<{
    dayName: string;
    icon: string;
    tempMax: number;
    tempMin: number;
  }>;
}

const WeatherWidget: React.FC<{ data: WeatherData }> = ({ data }) => {
  if (!data.success) {
    return null;
  }

  const { current, daily, location } = data;

  return (
    <div className="rounded-lg border border-border p-4 sm:p-5 my-4 w-full max-w-md mx-auto bg-background text-foreground">
      <div className="text-center mb-4 sm:mb-5">
        <div className="rounded-full px-4 py-1.5 inline-block mb-3 border border-border bg-muted/40">
          <p className="text-foreground text-sm sm:text-base font-medium">Weather in {location.split(',')[0]}</p>
        </div>
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1.5">
            <span className="text-3xl sm:text-4xl font-light">{current.temperature}{current.unit}</span>
            <span className="text-xl sm:text-2xl">{current.icon}</span>
          </div>
          <p className="text-foreground/80 text-sm sm:text-base capitalize">{current.weatherDescription}</p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">{location}</p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {daily.slice(0, 7).map((day, index) => (
          <div key={index} className="flex items-center justify-between py-2.5 sm:py-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-xl sm:text-2xl w-7 sm:w-8 text-center">{day.icon}</span>
              <span className="text-foreground font-medium text-sm sm:text-base w-24 truncate">{day.dayName}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-right">
              <span className="text-foreground text-sm sm:text-base font-medium">{day.tempMax}°</span>
              <span className="text-muted-foreground text-sm sm:text-base font-normal">{day.tempMin}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper component for rendering weather in markdown
export const WeatherDisplay: React.FC<{ weatherData: string }> = ({ weatherData }) => {
  try {
    const data: WeatherData = JSON.parse(weatherData);
    return <WeatherWidget data={data} />;
  } catch (error) {
    return null;
  }
};

export default WeatherWidget;