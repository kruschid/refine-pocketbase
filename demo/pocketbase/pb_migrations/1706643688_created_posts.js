/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const collection = new Collection({
      id: "ail3957ess6fp6i",
      created: "2024-01-30 19:41:28.914Z",
      updated: "2024-01-30 19:41:28.914Z",
      name: "posts",
      type: "base",
      system: false,
      schema: [
        {
          system: false,
          id: "jisgasm8",
          name: "title",
          type: "text",
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: "",
          },
        },
      ],
      indexes: [],
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      options: {},
    });

    new Dao(db).saveCollection(collection);

    new Dao(db).saveRecord(
      new Record(collection, {
        title: "first entry",
      })
    );
    new Dao(db).saveRecord(
      new Record(collection, {
        title: "second entry",
      })
    );
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("ail3957ess6fp6i");

    return dao.deleteCollection(collection);
  }
);
