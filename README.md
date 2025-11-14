# **Homebridge Dwelo Advanced**

A Homebridge platform plugin for Dwelo (now Ambient) smart home systems.  
This plugin provides native HomeKit support for supported Dwelo thermostats and dimmer switches. It is built on the modern Homebridge plugin template using TypeScript.  
This project is not affiliated with Dwelo, LLC or Ambient.  

> [!WARNING]  
> Beta Software: Under Development  
>This plugin is in active development. It has been built based on reverse-engineered API calls from a specific set of devices. Not all features may function as expected, and it may not support all hardware variations found in different Dwelo-equipped properties.  
>Please use at your own risk and consider contributing any findings by [opening an issue](https://www.google.com/search?q=https://github.com/YourUsername/homebridge-dwelo-advanced/issues) on GitHub.

## **Features**

* **Platform-Based:** Discovers all your supported devices automatically.  
* **Thermostat Control:** Full HomeKit support including **Heat**, **Cool**, **Auto**, and **Off** modes, plus temperature setpoints.  
* **Fan Control:** Control your thermostat's fan independently (Auto/Manual).  
* **Dimmer Light Control:** Full support for Dwelo dimmer switches, including **On**, **Off**, and **Brightness** control.

## **Installation**

1. Install [Homebridge](https://homebridge.io/) using the official instructions.  
2. Install this plugin using the Homebridge UI or by running:  
   npm install \-g homebridge-dwelo-advanced

3. Restart Homebridge.

## **Configuration**

Add the platform to your config.json file. The easiest way to do this is using the Homebridge UI.  
{  
  "platform": "DweloAdvanced",  
  "name": "DweloAdvanced",  
  "token": "YOUR\_API\_TOKEN\_HERE",  
  "gatewayId": "YOUR\_GATEWAY\_ID\_HERE"  
}

### **Configuration Fields**

* **platform** (Required): Must be "DweloAdvanced".  
* **name** (Required): A friendly name for the platform (e.g., "Dwelo").  
* **token** (Required): Your Dwelo v3 API authorization token.  
* **gatewayId** (Required): The unique ID for your apartment's Dwelo hub.

## **Finding Your Credentials**

To use this plugin, you must find your token and gatewayId. The easiest way to do this is with your browser's Developer Tools.  
This method is based on the original work by [leolll/dwelo-lights](https://github.com/leolll/dwelo-lights).

### **Step 1: Open Developer Tools**

1. On your computer (Chrome or Firefox is recommended), open a new "Incognito" or "Private" window.  
2. Go to the Dwelo/Ambient login page: [**https://app.dwelo.com/**](https://www.google.com/search?q=https://app.dwelo.com/)  
3. Open Developer Tools **before** you log in.  
   * **Mac:** Cmd \+ Opt \+ I  
   * **Windows:** F12 or Ctrl \+ Shift \+ I  
4. Click on the **"Network"** tab in the Developer Tools panel.

### **Step 2: Find Your API Token**

1. With the Network tab open, log in to your Dwelo account as usual.  
2. In the filter box at the top of the Network panel, type: **sessions**  
3. Click on the request named **sessions** that appears in the list.  
4. A new pane will open. Click the **"Headers"** tab.  
5. Scroll down to the **"Request Headers"** section.  
6. Find the Authorization header. The value will look like Bearer eyJ....  
7. Copy the entire long string of characters **after** Bearer (starting with ey...). This is your **token**.

### **Step 3: Find Your Gateway ID**

1. Clear the filter box in the Network tab (where you typed sessions).  
2. In the filter box, now type: **gateways**  
3. You should see a request named **gateways**. Click on it.  
4. In the new pane, click the **"Response"** or **"Preview"** tab.  
5. You will see a small bit of JSON data. Find the id field.  
6. The value (starting with gwy\_...) is your **gatewayId**.  
   \[  
     {  
       "id": "gwy\_a1b2c3d4e5f67890",  
       "communityId": "...",  
       "unitId": "..."  
     }  
   \]

You now have both values needed for the plugin configuration\!

## **Development**

This plugin is built with TypeScript and uses the official Homebridge plugin template.

### **Get Started**

\# Clone your repository  
git clone \[https://github.com/YourUsername/homebridge-dwelo-advanced.git\](https://github.com/YourUsername/homebridge-dwelo-advanced.git)  
cd homebridge-dwelo-advanced

\# Install dependencies  
npm install

### **Available Scripts**

* **Install dependencies**  
  npm install

* **Run the build command (compiles TS to JS)**  
  npm run build

* **Run the lint command (checks for style errors)**  
  npm run lint

* **Run the fix command (auto-fixes style errors)**  
  npm run lint \-- \--fix

* **Run a test Homebridge instance**  
  homebridge \-D \-U ./temp-homebridge
