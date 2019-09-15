import { Service } from "typedi";

@Service()
export default class ConfigService {
  constructor(private config: any) {}

  get<T>(key: string): T {
    return this.config[key];
  }
}
