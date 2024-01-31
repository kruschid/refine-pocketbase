import { AuthPage, ErrorComponent, Refine } from "@refinedev/core";
import { HeadlessCreateInferencer, HeadlessEditInferencer, HeadlessListInferencer, HeadlessShowInferencer } from "@refinedev/inferencer/headless";
import routerBindings, { DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import PocketBase from "pocketbase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { authProvider, dataProvider, liveProvider } from "../src";
import { Layout } from "./Layout";
import { POCKETBASE_URL } from "./config";

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
          name: "posts",
          list: "/posts",
          create: "/posts/create",
          edit: "/posts/edit/:id",
          show: "/posts/show/:id",
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
            <Route index element={<HeadlessListInferencer />} />
            <Route path="create" element={<HeadlessCreateInferencer />} />
            <Route path="edit/:id" element={<HeadlessEditInferencer />} />
            <Route path="show/:id" element={<HeadlessShowInferencer />} />
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
