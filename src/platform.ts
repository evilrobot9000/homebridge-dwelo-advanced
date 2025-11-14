import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import axios from 'axios';
// We do NOT import AxiosInstance, as it's not exported
import { DweloDimmerAccessory } from './dimmerAccessory.js';
import { DweloThermostatAccessory } from './thermostatAccessory.js';

/**
 * HomebridgePlatform
 * This class is the main entry point of your plugin.
 */
export class DweloPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  // --- FIX #1: Infer the type from the 'axios.create' function ---
  // This avoids the "AxiosInstance" import error
  public readonly axios: ReturnType<typeof axios.create>;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.info('Finished initializing platform:', this.config.name);

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    // --- OUR DWELO API SETUP ---
    this.axios = axios.create({
      baseURL: 'https://api.dwelo.com/v3',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
      },
    });

    this.api.on('didFinishLaunching', () => {
      log.info('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  /**
   * Our main device discovery logic.
   */
  async discoverDevices() {
    this.log.info('Discovering Dwelo devices...');

    if (!this.config.gatewayId || !this.config.token) {
      this.log.error('Gateway ID or API Token is missing from config. Please check your plugin settings.');
      return;
    }

    try {
      // Fetch all devices associated with the gateway
      const response = await this.axios.get(`/gateways/${this.config.gatewayId}/devices`);
      const devices = response.data;

      if (!Array.isArray(devices)) {
        this.log.error('Failed to get a valid device list from Dwelo API.');
        return;
      }

      // Loop over all devices and register them
      for (const device of devices) {
        // Generate a unique UUID for each accessory
        const uuid = this.api.hap.uuid.generate(device.id);
        const existingAccessory = this.accessories.find(acc => acc.UUID === uuid);

        if (existingAccessory) {
          // The accessory already exists, we just need to re-initialize it
          this.log.info('Restoring existing accessory:', device.name);
          
          if (device.type === 'dimmer') {
            new DweloDimmerAccessory(this, existingAccessory);
          } else if (device.type === 'thermostat') {
            new DweloThermostatAccessory(this, existingAccessory);
          } else {
            this.log.info(`Unsupported device type ${device.type}. Removing from cache if it exists.`);
            this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
          }

        } else {
          // The accessory does not exist, so we create it
          this.log.info('Registering new accessory:', device.name);
          const accessory = new this.api.platformAccessory(device.name, uuid);
          accessory.context.device = device; 

          if (device.type === 'dimmer') {
            new DweloDimmerAccessory(this, accessory);
            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          } else if (device.type === 'thermostat') {
            new DweloThermostatAccessory(this, accessory);
            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          } else {
            this.log.info(`Skipping unsupported device: ${device.name} (type: ${device.type})`);
          }
        }
      }

    } catch (error: unknown) { // --- FIX #2: Type-safe error handling ---
      if (error instanceof Error) {
        this.log.error('API Error:', error.message);
        // Check if it's an axios-like error by checking for the 'response' property
        if (error && typeof error === 'object' && 'response' in error && error.response) {
          // --- FIX #3: Linter-disable comment ---
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.log.error('API Response Data:', (error as any).response.data);
        }
      } else {
        this.log.error('An unknown error occurred:', error);
      }
    }
  }
}
