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
        {
          system: false,
          id: "3xyfauct",
          name: "content",
          type: "editor",
          required: false,
          presentable: false,
          unique: false,
          options: {
            convertUrls: false,
          },
        },
        {
          system: false,
          id: "vqky88vl",
          name: "date",
          type: "date",
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: "",
            max: "",
          },
        },
      ],
      indexes: [],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {},
    });

    return Dao(db).saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("ail3957ess6fp6i");

    return dao.deleteCollection(collection);
  }
);
