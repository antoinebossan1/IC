// ConfigHelper.ts
import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import { EventEmitter } from "events";
import { OpenAI } from "openai";

interface Config {
  apiKey: string;
  apiProvider: "openai"; // Added provider selection
  extractionModel: string;
  solutionModel: string;
  debuggingModel: string;
  language: string;
  opacity: number;
}

export class ConfigHelper extends EventEmitter {
  private configPath: string;
  private defaultConfig: Config = {
    apiKey: process.env.OPENAI_API_KEY,
    apiProvider: "openai", // Default to Gemini
    extractionModel: "gpt-5", // Default to Flash for faster responses
    solutionModel: "gpt-5",
    debuggingModel: "gpt-5",
    language: "python",
    opacity: 1.0,
  };

  constructor() {
    super();
    // Use the app's user data directory to store the config
    try {
      this.configPath = path.join(app.getPath("userData"), "config.json");
      console.log("Config path:", this.configPath);
    } catch (err) {
      console.warn("Could not access user data path, using fallback");
      this.configPath = path.join(process.cwd(), "config.json");
    }

    // Ensure the initial config file exists
    this.ensureConfigExists();
  }

  /**
   * Ensure config file exists
   */
  private ensureConfigExists(): void {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.saveConfig(this.defaultConfig);
      }
    } catch (err) {
      console.error("Error ensuring config exists:", err);
    }
  }

  public loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, "utf8");
        const config = JSON.parse(configData);

        return {
          ...this.defaultConfig,
          ...config,
        };
      }

      // If no config exists, create a default one
      this.saveConfig(this.defaultConfig);
      return this.defaultConfig;
    } catch (err) {
      console.error("Error loading config:", err);
      return this.defaultConfig;
    }
  }

  /**
   * Save configuration to disk
   */
  public saveConfig(config: Config): void {
    try {
      // Ensure the directory exists
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      // Write the config file
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (err) {
      console.error("Error saving config:", err);
    }
  }

  /**
   * Update specific configuration values
   */
  public updateConfig(updates: Partial<Config>): Config {
    try {
      const currentConfig = this.loadConfig();
      let provider = updates.apiProvider || currentConfig.apiProvider;

      // Auto-detect provider based on API key format if a new key is provided
      if (updates.apiKey && !updates.apiProvider) {
        // If API key starts with "sk-", it's likely an OpenAI key
        if (updates.apiKey.trim().startsWith("sk-")) {
          provider = "openai";
          console.log("Auto-detected OpenAI API key format");
        }

        // Update the provider in the updates object
        updates.apiProvider = provider;
      }

      // If provider is changing, reset models to the default for that provider
      if (
        updates.apiProvider &&
        updates.apiProvider !== currentConfig.apiProvider
      ) {
        if (updates.apiProvider === "openai") {
          updates.extractionModel = "gpt-5";
          updates.solutionModel = "gpt-5";
          updates.debuggingModel = "gpt-5";
        }
      }

      const newConfig = { ...currentConfig, ...updates };
      this.saveConfig(newConfig);

      // Only emit update event for changes other than opacity
      // This prevents re-initializing the AI client when only opacity changes
      if (
        updates.apiKey !== undefined ||
        updates.apiProvider !== undefined ||
        updates.extractionModel !== undefined ||
        updates.solutionModel !== undefined ||
        updates.debuggingModel !== undefined ||
        updates.language !== undefined
      ) {
        this.emit("config-updated", newConfig);
      }

      return newConfig;
    } catch (error) {
      console.error("Error updating config:", error);
      return this.defaultConfig;
    }
  }

  /**
   * Check if the API key is configured
   */
  public hasApiKey(): boolean {
    const config = this.loadConfig();
    return !!config.apiKey && config.apiKey.trim().length > 0;
  }

  /**
   * Get the stored opacity value
   */
  public getOpacity(): number {
    const config = this.loadConfig();
    return config.opacity !== undefined ? config.opacity : 1.0;
  }

  /**
   * Set the window opacity value
   */
  public setOpacity(opacity: number): void {
    // Ensure opacity is between 0.1 and 1.0
    const validOpacity = Math.min(1.0, Math.max(0.1, opacity));
    this.updateConfig({ opacity: validOpacity });
  }

  /**
   * Get the preferred programming language
   */
  public getLanguage(): string {
    const config = this.loadConfig();
    return config.language || "python";
  }

  /**
   * Set the preferred programming language
   */
  public setLanguage(language: string): void {
    this.updateConfig({ language });
  }
}

// Export a singleton instance
export const configHelper = new ConfigHelper();
