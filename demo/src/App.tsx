import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import { HeadlessCreateInferencer, HeadlessEditInferencer, HeadlessListInferencer, HeadlessShowInferencer } from "@refinedev/inferencer/headless";
import routerBindings, { DocumentTitleHandler, NavigateToResource } from "@refinedev/react-router";
import PocketBase from "pocketbase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { type AuthOptions, authProvider, dataProvider, liveProvider } from "refine-pocketbase";
import { CustomPage } from "./pages/CustomPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UpdatePasswordPage } from "./pages/UpdatePasswordPage";
import { POCKETBASE_URL } from "./utils/config";

const pb = new PocketBase(POCKETBASE_URL);

const authOptions: AuthOptions = {
  registerRedirectTo: "/posts",
  loginRedirectTo: "/posts",
  updatePasswordRedirectTo: "/login"
}

const providers = {
  dataProvider: dataProvider(pb),
  liveProvider: liveProvider(pb),
  authProvider: authProvider(pb, authOptions),
}

export const App = () =>
  <BrowserRouter>
    <Refine
      {...providers}
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
        {
          name: "custom",
          list: "/custom",
        },
      ]}
      options={{
        liveMode: "auto",
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        projectId: "K2WTtI-rl83Fw-Fn1FJF",
      }}
    >
      <Routes>
        <Route element={
          <Authenticated
            key="authenticated-inner"
            redirectOnFail="/login"
          >
            <Outlet />
          </Authenticated>
        }>
          <Route
            index
            element={<NavigateToResource resource="posts" />}
          />
          <Route index path="/custom" element={<CustomPage />} />
          <Route path="/posts">
            <Route index element={<HeadlessListInferencer resource="posts" />} />
            <Route path="create" element={<HeadlessCreateInferencer resource="posts" />} />
            <Route path="edit/:id" element={<HeadlessEditInferencer resource="posts" />} />
            <Route path="show/:id" element={<HeadlessShowInferencer resource="posts" />} />
          </Route>
        </Route>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="*" element={<ErrorComponent />} />
      </Routes>
      <DocumentTitleHandler />
    </Refine>
  </BrowserRouter>
