import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { DweloPlatform } from './platform.js';

/**
 * DweloDimmerAccessory
 * This class handles all the logic for a Dwelo Dimmer light.
 */
export class DweloDimmerAccessory {
  private service: Service;

  constructor(
    private readonly platform: DweloPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const device = this.accessory.context.device;
    
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb, device.name);

    this.service.setCharacteristic(this.platform.Characteristic.Name, device.name);

    // Register handlers for On/Off
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this));

    // Register handlers for Brightness
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this));
  }

  /**
   * Sends a command to the Dwelo API
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
   * Handle "Set On" requests from HomeKit
   */
  async setOn(value: CharacteristicValue) {
    const command = value ? 'on' : 'off';
    this.platform.log.info(`Setting light ${this.accessory.displayName} to ${command}`);
    await this.sendCommand({ command });
  }

  /**
   * Handle "Set Brightness" requests from HomeKit
   */
  async setBrightness(value: CharacteristicValue) {
    const brightness = value as number;
    this.platform.log.info(`Setting brightness for ${this.accessory.displayName} to ${brightness}%`);

    // Use the "Multilevel On" command we discovered!
    await this.sendCommand({
      command: 'Multilevel On',
      commandValue: String(brightness),
    });
  }
}
