import { Request, Response, NextFunction } from "express";
import { WeatherService } from "../services/WeatherService";

export class WeatherController {
  private weatherService: WeatherService;

  constructor() {
    this.weatherService = new WeatherService();
  }
  
  public async getUnifiedForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lon, tz, cache } = req.query;

      const latitude = Number(lat);
      const longitude = Number(lon);
      const timezone = tz as string;
      const bypassCache = cache === "false";

      const result = await this.weatherService.getUnifiedForecast(
        latitude,
        longitude,
        timezone,
        bypassCache
      );

      res.setHeader("X-Source", result.source);
      return res.json({ source: result.source, ...result.data });
    } catch (error) {
      return next(error);
    }
  }

  public async getDateForecast(req: Request, res: Response, next: NextFunction) {
    try {
        const { lat, lon, date, tz } = req.query;
        
        const result = await this.weatherService.getDateForecast(
            Number(lat), 
            Number(lon), 
            date as string, 
            tz as string
        );

        return res.json(result);
    } catch (error) {
        return next(error);
    }
  }
}
