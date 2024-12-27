/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = new Collection({
      createRule: "",
      deleteRule: "",
      fields: [
        {
          autogeneratePattern: "[a-z0-9]{15}",
          hidden: false,
          id: "text3208210256",
          max: 15,
          min: 15,
          name: "id",
          pattern: "^[a-z0-9]+$",
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: "text",
        },
        {
          autogeneratePattern: "",
          hidden: false,
          id: "text724990059",
          max: 0,
          min: 0,
          name: "title",
          pattern: "",
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: "text",
        },
        {
          hidden: false,
          id: "autodate2990389176",
          name: "created",
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: "autodate",
        },
        {
          hidden: false,
          id: "autodate3332085495",
          name: "updated",
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: "autodate",
        },
      ],
      id: "pbc_1125843985",
      indexes: [],
      listRule: "",
      name: "posts",
      system: false,
      type: "base",
      updateRule: "",
      viewRule: "",
    });

    app.save(collection);

    app.save(
      new Record(collection, {
        title: "first entry",
      })
    );

    app.save(
      new Record(collection, {
        title: "second entry",
      })
    );
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1125843985");

    return app.delete(collection);
  }
);
