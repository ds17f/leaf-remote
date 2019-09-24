# leaf-bit
leaf-bit is a FitBit app for communicating with the Nissan Leaf's remote control systems.

# Features
* Climate Start
* Climate Stop

# Motivation
I wanted to reliably start and stop climate control in my Leaf because I live in a hot climate and have a small child.
I found that the official app was unreliable and most third party apps required several interactions to start climate control
( open app, login, menu to find option, read screen to see results). 

The app which required the least interaction (on Android) was `QuickLeaf` which I highly recommend.  It has a clear user interface
you can drop a one-touch shortcut on the home screen, and it works as well as Nissan's system will allow.

Even with `QuickLeaf`, I found that the times that I needed to start the AC were the times that I had a baby in one hand, groceries in the other
and taking my phone out and looking at the screen was simply not an option.  The result was a hot car and a sad kid.

I turned my attention to my FitBit Versa, and this project was born.

# Using leaf-bit
The user interface is designed to be simple and to work without the need to look at the FitBit.

## Settings
You need to configure the app so that it can talk to your car.  You do this in the `Settings` component of the FitBit app on your phone.

### Username / Password
You'll see fields for `username` and `password`.  You should enter the username and password that you use in the Nissan Connect EV app, 
not the pin/pass that you enter in the Leaf's head unit.

### Polling Interval / Timeout
You can control the rate at which leaf-bit polls the Nissan API checking for an update to your request.
You can also control the amount of time to wait before you give up and assume that the request failed.

## Tiles
There are **3 "Tiles" or screens that you can page through.**  They are:
* Climate Start
* Climate Stop
* Message Console

## Buttons
You interact with the app by **using the buttons on the right side** of the device.
* `Bottom Button`: "Next" tile
* `Top Button`: "Do" action (depending on the tile)

After you "Do" an action the app will display the console and provide information about interacting with the Nissan API.
This is where you'll see success/failure/progress messages.

## Haptics
The device will **vibrate** so that you can get feedback without looking at it.  The vibrations are:
* `Connect success/failure`: Your watch needs to connect to your phone in order to make calls to Nissan.
  * `success`: strong vibration and display of the `Climate Start` tile.
  * `failure`: After 20 seconds, a strong vibration and a message on the `Message Console` tile.
* `Next Tile`: A light vibration to let you know the tile has changed.
* `Do Action`: A light vibration to let you know the action has been requested.
* `Action success/failure`: A strong vibration to let you know that the action has completed.

## Console
The `Message Console` tile is the primary means for checking on the status of your request.

# Common Issues
The Nissan Leaf's remote control system is prone to errors at several different layers.
leaf-bit seeks to work around some of these issues but introduces a few others that are specific to the FitBit ecosystem.
The section that follows seeks to provide insight and remediation for these issues based on my experience building this app.

There are 3 main components where issues can arise: 
* Fitbit - You need to get a message from your watch, to your phone, to the Nissan API.
* Nissan API - Once the message gets to the API it needs to be well formed and accepted.
* Leaf - The API then calls out over the AT&T 3G network to talk to your car.  The car takes action and responds to the API.

## Fitbit
> Note: I have a FitBit Versa and an Android phone, so what's described here may be specific to that setup.
### Peer Connect Failed
#### Issue
The FitBit device (watch) must connect to the companion (phone) in order to call the Nissan API.
You may see repeated `Peer Connect` failures when you start the app.  You'll get a vibration after 20 seconds,
a message that tells you the connection failed, and the icon on the bottom of the screen will be the yellow "out of fuel" light.
#### Solution
You need to troubleshoot the connection between your watch and phone.
Begin by restarting both and waiting a bit after they come up.
You can try to manually sync the device to the phone inside the fitbit app.

You should check the [FitBit documentation](https://help.fitbit.com/articles/en_US/Help_article/1866) for your device 
and otherwise seek help on the FitBit website.

## Nissan API
### Login Failed
#### Issue
You get a message in the `Message Console` that login failed.
#### Solution
Double check your username and password in the settings for leaf-bit in the FitBit phone app.
You must use the credentials you use in the Nissan Connect EV app, or in the Nissan owner portal.
Do not use the pin/password that you enter in the Leaf's radio.
### Climate Start/Stop Failed
#### Issue
You get a message in the `Message Console` that says "Climate {Start|Stop} Failed <some error>".
#### Solution 1
The Nissan API failed to communicate with the Leaf.  You can install the Nissan Connect EV app
and turn on notifications.  This allows the Nissan API to send you push notifications describing
what it thinks happened in your request.  You'll often get failure messages that communicate:
* The car is on or the battery is very low
* The car has bad service on the 3g network

It can take a few minutes for these messages to appear, 
and they don't always communicate the root cause of the issue.
The upside is that they will let you know that your API call worked, 
even if the result of that call failed.
#### Solution 2
If you've turned on notifications in the Nissan Connect EV app and you don't get a notification
about why your request failed, it is possible that the Nissan API is having issues.
You should try again in a short amount of time.  You might even try again right away.
#### Solution 3
If you've tried again and the issue persists, it's possible that the API has changed 
and leaf-bit needs to be updated.  Please open a support request in the [Issue Tracker](/leaf-bit/issues)

## Leaf
The Leaf itself is the most sensitive part of the system.
Generally speaking when leaf-bit fails to start/stop climate it's a result of 
the Leaf being unresponsive.

The Leaf's on-board remote control is comprised of the `Carwings` head unit, and a `TCU` or Telecommunications Unit.
* The `Carwings` head unit is the radio with a touch screen.  This is where you enter username/password, choose a SiriusXM channel, connect your phone, etc...  It's the frontend to the car for a user.
* The `TCU` controls the 3G modem which provides the data connection to the Nissan API

The `TCU` has a tendency to be the point of failure in the car.  Most commonly:
* The 3G network that the `TCU` is connected to is weak and the car ends up offline.
* The main computer puts the `TCU` into sleep mode (taking it offline) for undetermined reasons.
  * There is anecdotal evidence that the `TCU` will sleep if the Leaf's 12V battery drops below `12.5V`.
  * There is anecdotal evidence that the `TCU` will sleep if the car is plugged in and not charging for extended periods of time.

### Climate Start/Stop Failed
#### Issue
* You get a message in the `Message Console` that says "Climate {Start|Stop} Failed <some error>".
* You also have turned on push notifications in the Nissan Connect EV app and you received a message saying: 
  * The car has bad service on the 3g network
* You have tried a few times and seen the same message.
* You have successfully started/stopped climate with your Leaf parked in its current position
#### Solution 1




