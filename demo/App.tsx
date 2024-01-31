import { AuthPage, ErrorComponent, Refine } from "@refinedev/core";
// import { HeadlessCreateInferencer, HeadlessEditInferencer, HeadlessListInferencer, HeadlessShowInferencer } from "@refinedev/inferencer/headless";
import routerBindings, { DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import PocketBase from "pocketbase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { authProvider, dataProvider, liveProvider } from "../src";
import { Layout } from "./Layout";

const pb = new PocketBase(POCKETBASE_URL);

export const App = () =>
  <BrowserRouter>
    <Refine
      dataProvider={dataProvider(pb)}
      liveProvider={liveProvider(pb)}
      authProvider={authProvider(pb)}
      routerProvider={routerBindings}
      resources={[
        {
          name: "blog_posts",
          list: "/blog-posts",
          create: "/blog-posts/create",
          edit: "/blog-posts/edit/:id",
          show: "/blog-posts/show/:id",
          meta: {
            canDelete: true,
          },
        },
        {
          name: "categories",
          list: "/categories",
          create: "/categories/create",
          edit: "/categories/edit/:id",
          show: "/categories/show/:id",
          meta: {
            canDelete: true,
          },
        },
      ]}
      options={{
        liveMode: "auto",
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
        projectId: "K2WTtI-rl83Fw-Fn1FJF",
      }}
    >
      <Routes>
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route
            index
            element={<NavigateToResource resource="posts" />}
          />
          <Route path="/posts">
            {/* <Route index element={<HeadlessListInferencer />} />
            <Route path="create" element={<HeadlessCreateInferencer />} />
            <Route path="edit/:id" element={<HeadlessEditInferencer />} />
            <Route path="show/:id" element={<HeadlessShowInferencer />} /> */}
          </Route>
          <Route path="/register" element={<AuthPage type="register" />} />
          <Route path="/login" element={<AuthPage type="login" />} />
          <Route path="/forgot-password" element={<AuthPage type="forgotPassword" />} />
          <Route path="/update-password" element={<AuthPage type="updatePassword" />} />
          <Route path="*" element={<ErrorComponent />} />
        </Route>
      </Routes>
      <UnsavedChangesNotifier />
      <DocumentTitleHandler />
    </Refine>
  </BrowserRouter>
