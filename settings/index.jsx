function settingsComponent(props) {
  return (
    <Page>
      <Section
        title={
          <Text bold align="center">
            Nissan API Credentials
          </Text>
        }
      />
      <Text>
        Please enter your username/password for connecting to Nissan's API.
        These are the credentials you enter into the NissanConnect app or the
        Nissan website.  These are not the credentials you enter in the car's
        head unit.
      </Text>
      <TextInput label="username" settingsKey="username"/>
      <TextInput label="password" settingsKey="password" type="password" />
      <Section
        title={
          <Text bold align="center">
            Options
          </Text>
        }
      />
      <TextInput label="API Timeout" settingsKey="apiTimeout" />
      <TextInput label="API Poll Interval (seconds)" settingsKey="apiPollInterval" />
      <Section
        title={
          <Text bold align="center">
            Debugging
          </Text>
        }
      />
      <Toggle
        label="Debug Mode"
        settingsKey="debug" />
      <Toggle
        label="Demo Mode"
        settingsKey="demo" />
      <Toggle
        label="Quiet Mode"
        settingsKey="quiet" />
    </Page>
  );
}

registerSettingsPage(settingsComponent);
