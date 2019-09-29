function settingsComponent(props) {
  const isDebug = JSON.parse(props.settings.debug);
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
      </Section>
      <Section
        title={
          <Text bold align="center">
            Options
          </Text>
        }>
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
        </Section>
      }
      <Link source="https://github.com/damiansilbergleithcunniff/leaf-bit/blob/master/README.md">Need Help?</Link>
    </Page>
  );
}

registerSettingsPage(settingsComponent);
