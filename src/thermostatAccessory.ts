import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { DweloPlatform } from './platform.js';

/**
 * DweloThermostatAccessory
 * This class handles all the logic for a Dwelo Thermostat.
 */
export class DweloThermostatAccessory {
  private thermostatService: Service;
  private fanService: Service;

  constructor(
    private readonly platform: DweloPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const device = this.accessory.context.device;

    // 1. THERMOSTAT SERVICE
    this.thermostatService = this.accessory.getService(this.platform.Service.Thermostat) ||
      this.accessory.addService(this.platform.Service.Thermostat, device.name);
    
    this.thermostatService.setCharacteristic(this.platform.Characteristic.Name, device.name);

    // 2. FAN SERVICE (as a separate, linked service)
    this.fanService = this.accessory.getService(this.platform.Service.Fanv2) ||
      this.accessory.addService(this.platform.Service.Fanv2, `${device.name} Fan`);

    // --- Thermostat Characteristic Handlers ---
    this.thermostatService.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onSet(this.setHeatingCoolingState.bind(this));

    this.thermostatService.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
      .onSet(this.setCoolingThreshold.bind(this));

    this.thermostatService.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
      .onSet(this.setHeatingThreshold.bind(this));

    this.thermostatService.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(() => this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS);

    // --- Fan Characteristic Handlers ---
    this.fanService.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setFanActive.bind(this));
  }

  /**
   * Sends a command to the Dwelo API.
   */
  async sendCommand(payload: object) {
    const deviceId = this.accessory.context.device.id;
    const commandPayload = { ...payload, applicationId: 'ios' };

    try {
      this.platform.log.info(`Sending Command for ${this.accessory.displayName}: ${JSON.stringify(commandPayload)}`);
      await this.platform.axios.post(`/device/${deviceId}/command/`, commandPayload);
      this.platform.log.info(`Successfully sent command for ${this.accessory.displayName}.`);
    } catch (error: unknown) { // Explicitly type error as 'unknown'
      // --- FIX ---
      // Simplified, type-safe error handling
      if (error instanceof Error) {
        this.platform.log.error(`API Error for ${this.accessory.displayName}:`, error.message);
        // Check if it's an axios-like error by checking for the 'response' property
        if (error && typeof error === 'object' && 'response' in error && error.response) {
          this.platform.log.error('API Response Data:', (error as any).response.data);
        }
      } else {
        this.platform.log.error(`Failed to send command for ${this.accessory.displayName} with an unknown error:`, error);
      }
    }
  }

  /**
   * Handles setting the main thermostat mode (OFF, HEAT, COOL, AUTO)
   */
  async setHeatingCoolingState(value: CharacteristicValue) {
    let command: string;
    switch (value) {
      case this.platform.Characteristic.TargetHeatingCoolingState.OFF:
        command = 'off';
        break;
      case this.platform.Characteristic.TargetHeatingCoolingState.HEAT:
        command = 'heat';
        break;
      case this.platform.Characteristic.TargetHeatingCoolingState.COOL:
        command = 'cool';
        break;
      case this.platform.Characteristic.TargetHeatingCoolingState.AUTO:
        command = 'auto';
        break;
      default:
        this.platform.log.warn(`Unsupported heating/cooling state: ${value}`);
        return;
    }
    await this.sendCommand({ command });
  }

  /**
   * Handles setting the cooling setpoint.
   */
  async setCoolingThreshold(value: CharacteristicValue) {
    const temp = value as number;
    this.platform.log.info(`Setting Cooling Threshold to ${temp}°C`);
    await this.sendCommand({
      command: 'cool',
      commandValue: String(temp),
    });
  }

  /**
   * Handles setting the heating setpoint.
   */
  async setHeatingThreshold(value: CharacteristicValue) {
    const temp = value as number;
    this.platform.log.info(`Setting Heating Threshold to ${temp}°C`);
    await this.sendCommand({
      command: 'heat',
      commandValue: String(temp),
    });
  }

  /**
   * Handles the Fan's Active state (Manual vs Auto).
   */
  async setFanActive(value: CharacteristicValue) {
    const commandValue = (value === this.platform.Characteristic.Active.ACTIVE)
      ? 'ManualLow' // HomeKit 'On' maps to 'ManualLow'
      : 'AutoLow';  // HomeKit 'Auto' maps to 'AutoLow'
      
    this.platform.log.info(`Setting Fan Mode to ${commandValue}`);
    await this.sendCommand({
      command: 'FanMode',
      commandValue: commandValue,
    });
  }
}
