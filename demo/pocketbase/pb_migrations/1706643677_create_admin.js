/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);

    const settings = dao.findSettings();
    settings.smtp.enabled = true;
    settings.smtp.host = "inbucket";
    settings.smtp.port = 2500;
    settings.meta.resetPasswordTemplate.body = "{TOKEN}";
    dao.saveSettings(settings);

    const admin = new Admin();
    admin.email = "test@example.com";
    admin.setPassword(1234567890);
    dao.saveAdmin(admin);

    const collection = dao.findCollectionByNameOrId("users");

    const appUser = new Record(collection);
    appUser.setUsername("testapp.user");
    appUser.setEmail("test-appuser@example.com");
    appUser.setPassword(1234567890);
    appUser.setVerified(true);
    dao.saveRecord(appUser);
  },
  (db) => {
    const dao = new Dao(db);
    const admin = dao.findAdminByEmail("test@example.com");
    const appUser = dao.findAdminByEmail("test-appuser@example.com");

    dao.deleteAdmin(admin);
    dao.deleteRecord(appUser);
  }
);
