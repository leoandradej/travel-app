import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link, useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";

const PageLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();

    navigate("/sign-in");
  };
  return (
    <main className="auth">
      <section className="size-full glassmorphism flex-center px-6">
        <div className="sign-in-card">
          <header className="header">
            <Link to="/">
              <img
                src="/assets/icons/logo.svg"
                alt="Logo"
                className="size-[30px]"
              />
            </Link>
            <h1 className="p-28-bold text-dark-100">Tourvisto</h1>
          </header>

          <article>
            <h2 className="p-28-semibold text-dark-100 text-center">
              Admin Dashboard
            </h2>
            <p className="p-18-regular text-center text-gray-100 leading-7!">
              Click down below to be redirected to the Dashboard.
              <br /> If your not logged-in with an Admin account, please Log Out
              and try another account.
            </p>
          </article>

          <div className="flex flex-col gap-3">
            <ButtonComponent
              type="button"
              className="button-class h-11! w-full! text-white!"
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              Go to the Dashboard (Admin Only)
            </ButtonComponent>
            <ButtonComponent
              type="button"
              className="button-class-secondary h-11! w-full!"
              onClick={handleLogout}
            >
              <span>Log Out</span>
              <img
                src="/assets/icons/logout.svg"
                alt="Logout"
                className="size-6"
              />
            </ButtonComponent>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PageLayout;
