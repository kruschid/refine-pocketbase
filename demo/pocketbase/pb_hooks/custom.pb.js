routerAdd("GET", "/api/custom", (c) => {
    return c.json(200, {
        id: "1",
        title: "Custom Page Data",
        description: "This is some dummy content for the CustomPage in the demo application.",
    });
});

