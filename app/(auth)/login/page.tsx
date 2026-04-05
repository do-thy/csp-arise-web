import "./login.css";
import  { SignIn } from "../../components/AuthButton";
import { AdminSignInButton } from "../../components/AuthButton";
import { redirect } from "next/dist/server/api-utils";

export default function LoginPage() {
  return (
    <div className="overlay">
      <div className="login-page">
        <div className="login-container">
          <div className="login-left">
            <div className="left-content">
              <div className="logo-container">
                {/* Placeholder for logo image */}
              </div>
              <h1>ARISE</h1>
              <p>
                A cross-platform campus information system that integrates a 3D interactive map 
                and augmented reality features to provide digital access to room information.
              </p>
            </div>
          </div>
          <div className="login-right">
            <p> Select how you want to continue: </p>
            <div className="flex flex-col items-center">
              <SignIn />
              <AdminSignInButton /> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}