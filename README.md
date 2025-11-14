Homebridge Dwelo AdvancedWelcome to homebridge-dwelo-advanced, a Homebridge platform plugin for Dwelo (now Ambient) smart home systems.This plugin was built from the ground up using the modern Homebridge template. It uses the Dwelo v3 API to provide fast, reliable, and native HomeKit support for your apartment's smart devices.This project is not affiliated with Dwelo, LLC or Ambient.[!WARNING]Beta Software: Under DevelopmentThis plugin is currently in active development and testing. It has been built based on reverse-engineered API calls from a specific set of devices. Not all features may function as expected, and it may not support all hardware variations found in different Dwelo-equipped properties.Please use at your own risk and consider contributing any findings by opening an issue on GitHub.FeaturesPlatform-Based: Discovers all your supported devices automatically.Thermostat Control: Full HomeKit support for your thermostat, including Heat, Cool, Auto, and Off modes, plus setpoints.Fan Control: Control your thermostat's fan independently (Auto/Manual).Dimmer Light Control: Full support for Dwelo dimmer switches, including On, Off, and Brightness control.InstallationInstall Homebridge using the official instructions.Install this plugin using the Homebridge UI or by running:npm install -g homebridge-dwelo-advanced

Restart Homebridge.ConfigurationAdd the platform to your config.json file. The easiest way to do this is using the Homebridge UI.{
  "platform": "DweloAdvanced",
  "name": "DweloAdvanced",
  "token": "YOUR_API_TOKEN_HERE",
  "gatewayId": "YOUR_GATEWAY_ID_HERE"
}

Configuration Fieldsplatform (Required): Must be "DweloAdvanced".name (Required): A friendly name for the platform (e.g., "Dwelo").token (Required): Your Dwelo v3 API authorization token.gatewayId (Required): The unique ID for your apartment's Dwelo hub.Finding Your CredentialsTo use this plugin, you need to find two pieces of information from your Dwelo account: the token and the gatewayId. The easiest way to do this is by using your web browser's Developer Tools.This method is based on the original work by leolll/dwelo-lights.Step 1: Open Developer ToolsOn your computer (Chrome or Firefox is recommended), open a new "Incognito" or "Private" window.Go to the Dwelo/Ambient login page: https://app.dwelo.com/Open Developer Tools before you log in.Mac: Cmd + Opt + IWindows: F12 or Ctrl + Shift + IClick on the "Network" tab in the Developer Tools panel.Step 2: Find Your API TokenWith the Network tab open, log in to your Dwelo account as usual.You will see a list of network requests appear. In the filter box at the top of the Network panel, type: sessionsClick on the request named sessions.A new pane will open. Click the "Headers" tab.Scroll down to the "Request Headers" section.Find the Authorization header. The value will look like Bearer eyJ....Copy the entire long string of characters after Bearer  (starting with ey...). This is your token.Step 3: Find Your Gateway IDClear the filter box in the Network tab (where you typed sessions).In the filter box, now type: gatewaysYou should see a request named gateways. Click on it.In the new pane, click the "Response" or "Preview" tab.You will see a small bit of JSON data. Find the id field.The value (starting with gwy_...) is your gatewayId.[
  {
    "id": "gwy_a1b2c3d4e5f67890"  <-- THIS IS YOUR gatewayId
    // ...
  }
]

You now have both values needed for the plugin configuration!DevelopmentThis plugin is built with TypeScript and uses the official Homebridge plugin template.To get started:# Clone your repository
git clone [https://github.com/YourUsername/homebridge-dwelo-advanced.git](https://github.com/YourUsername/homebridge-dwelo-advanced.git)
cd homebridge-dwelo-advanced

# Install dependencies
npm install

# Run the build command (compiles TS to JS)
npm run build

# Run the lint command (checks for style errors)
npm run lint

# Run the fix command (auto-fixes style errors)
npm run lint -- --fix

# Run a test Homebridge instance
homebridge -D -U ./temp-homebridge

