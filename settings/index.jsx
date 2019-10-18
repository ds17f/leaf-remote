function settingsComponent(props) {
  let isDebug = false;
  try {
    isDebug = JSON.parse(props.settings.debug);
  } catch {
    isDebug = false;
  }

  return (
    <Page>

      <Section
        title={
          <Text bold align="center">
            Nissan API Credentials
          </Text>
        }>
        <Text>
          Please enter your username/password for connecting to Nissan's API.
          These are the credentials you enter into the NissanConnect app or the
          Nissan website.  These are not the credentials you enter in the car's
          head unit.
        </Text>
        <TextInput label="username" settingsKey="username"/>
        <TextInput label="password" settingsKey="password" type="password" />
        <TextInput label="Nissan Region Code" settingsKey="region"/>
      </Section>

      <Section
        title={
          <Text bold align="center">
            Analytics
          </Text>
        }>
        <Text>
          LeafRemote uses GoogleAnalytics to track usage.  Your IP is anonymized to prevent identifying you,
          but it's helpful to us to be able to track usage numbers in broad strokes and understand how users
          are using the app.  We use this information to develop new features.

          You can disable it with the toggle below, but we ask you to leave it on to help us.  This app is free
          and open source, and simple scan of the source code should show you how we're using the data.
        </Text>
        <Toggle
          label="Disable Analytics"
          settingsKey="disableAnalytics" />
      </Section>

      <Section
        title={
          <Text bold align="center">
            Options
          </Text>
        }>
        <Toggle
          label="Disable Touch"
          settingsKey="disableTouch" />
        <Toggle
          label="Swap Buttons (Top: Next, Bottom: Do)"
          settingsKey="swapButtons" />
        <Toggle
          label="Developer Options"
          settingsKey="debug" />
      </Section>

      {! isDebug ? "" :
        <Section
          title={
            <Text bold align="center">
              Developer Options
            </Text>
          }
        >
          <TextInput label="API Timeout" settingsKey="apiTimeout" />
          <TextInput label="API Poll Interval (seconds)" settingsKey="apiPollInterval" />
          <Toggle
            label="Demo Mode"
            settingsKey="demo" />
          <Toggle
            label="Disable Auto Exit"
            settingsKey="stayAlive" />
        </Section>
      }

      <Link source="https://github.com/damiansilbergleithcunniff/leaf-bit/blob/master/README.md">Need Help?</Link>

    </Page>
  );
}

registerSettingsPage(settingsComponent);
