import { AuthPage, Authenticated, ErrorComponent, Refine, useParsed, useUpdatePassword } from "@refinedev/core";
import { HeadlessCreateInferencer, HeadlessEditInferencer, HeadlessListInferencer, HeadlessShowInferencer } from "@refinedev/inferencer/headless";
import routerBindings, { CatchAllNavigate, DocumentTitleHandler, NavigateToResource } from "@refinedev/react-router-v6";
import PocketBase from "pocketbase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { AuthOptions, UpdatePasswordProps, authProvider, dataProvider, liveProvider } from "refine-pocketbase";
import { POCKETBASE_URL } from "./config";

const pb = new PocketBase(POCKETBASE_URL);

const authOptions: AuthOptions = {
  registerRedirectTo: "/posts",
  loginRedirectTo: "/posts",
  forgotPasswordRedirectTo: "/update-password",
  updatePasswordRedirectTo: "/login"
}

export const App = () =>
  <BrowserRouter>
    <Refine
      dataProvider={dataProvider(pb)}
      liveProvider={liveProvider(pb)}
      authProvider={authProvider(pb, authOptions)}
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
        <Route element={
          <Authenticated
            key="authenticated-inner"
            fallback={<CatchAllNavigate to="/login" />}
          >
            <Outlet />
          </Authenticated>
        }>
          <Route
            index
            element={<NavigateToResource resource="posts" />}
          />
          <Route path="/posts">
            <Route index element={<HeadlessListInferencer resource="posts" />} />
            <Route path="create" element={<HeadlessCreateInferencer resource="posts" />} />
            <Route path="edit/:id" element={<HeadlessEditInferencer resource="posts" />} />
            <Route path="show/:id" element={<HeadlessShowInferencer resource="posts" />} />
          </Route>
        </Route>
        <Route path="/register" element={<AuthPage type="register" />} />
        <Route path="/login" element={<AuthPage type="login" />} />
        <Route path="/forgot-password" element={<AuthPage type="forgotPassword" />} />
        <Route path="/update-password" Component={() => {
          const { params } = useParsed<{ token: string }>();
          const { mutate: updatePassword } = useUpdatePassword<UpdatePasswordProps>();
          const token = params?.token;

          return <AuthPage type="updatePassword" formProps={{
            onSubmit: (e: any) => {
              e.preventDefault();

              const password = e.target.password.value;
              const confirmPassword = e.target.confirmPassword.value;
              if (token) {
                updatePassword({ password, confirmPassword, token });
              }
            }
          }} />
        }} />
        <Route path="*" element={<ErrorComponent />} />
      </Routes>
      <DocumentTitleHandler />
    </Refine>
  </BrowserRouter>
