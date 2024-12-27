/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const settings = app.settings();

    settings.smtp.enabled = true;
    settings.smtp.host = "inbucket";
    settings.smtp.port = 2500;
    app.save(settings);

    const usersCollection = app.findCollectionByNameOrId("users");
    usersCollection.resetPasswordTemplate.body = "{TOKEN}";
    app.save(usersCollection);

    const superUser = new Record(app.findCollectionByNameOrId("_superusers"), {
      email: "test@example.com",
    });
    superUser.setPassword(1234567890);
    app.save(superUser);

    const user = new Record(app.findCollectionByNameOrId("users"), {
      email: "test-user@example.com",
    });
    user.setPassword(1234567890);
    app.save(user);
  },
  (app) => {
    const superUser = app.findAuthRecordByEmail(
      "_superusers",
      "test@example.com"
    );

    app.delete(superUser);

    const user = app.findAuthRecordByEmail("users", "test-user@example.com");

    app.delete(user);
  }
);
