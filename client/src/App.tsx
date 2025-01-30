import Cookies from "js-cookie";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AudioRecorder from "./components/audio-recorder";
import { OnboardingCarousel } from "./components/carousel-demo";
import DialPad from "./components/dialpad";
import { useUser } from "./components/hooks/use-user";
import PhotoEditor from "./components/image-editor/editor";
import { LoginForm } from "./components/login-form";
import ReviewPage from "./components/review-page";
import { SignUpForm } from "./components/sign-up-form";
import UserProfile from "./components/user-profile";
import { api } from "./lib/api";
import { User } from "./lib/types";
import InvitationPage from "./pages/acceptInvitation";
import ChatPage from "./pages/chat";
import ConsentUI from "./pages/consentui";
import Copyright from "./pages/Copyright";
import GroupPage from "./pages/creategroup";
import Dashboard from "./pages/dashboard";
import DocumentSummarizer from "./pages/document-summarizer";
import Genai from "./pages/genai";
import Home from "./pages/home";
import IPFSUpload from "./pages/ipfsUpload";
import SimplePartnershipDeed from "./pages/NonDisclosure";
import NotificationsScreen from "./pages/notifications";
import Ocr from "./pages/Ocr";
import SearchScreen from "./pages/search";
import Story from "./pages/story";
import Templates from "./pages/templates";
import LawComparison from "./pages/law-comparison";
import News from "./pages/news";
import MainLayout from "./layouts/main-layout";
import Meeting from "./pages/Meeting"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const cookie = Cookies.get("token");
  if (cookie) {
    return children;
  } else {
    return <Navigate to="/auth/login" />;
  }
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const cookie = Cookies.get("token");
  if (cookie) {
    return <Navigate to="/dashboard" />;
  } else {
    return children;
  }
};

export default function App() {
  const { setUser } = useUser();

  useEffect(() => {
    const getUser = async () => {
      const res = await api.get("/api/user/me");

      if (res.data.success) {
        setUser(res.data.data as User);
      }
    };
    getUser();
  }, []);

  return (
    <>
      <Routes>
        <Route path="" element={<MainLayout />}>
        <Route path="/meeting" element={<Meeting/>}/>
          {/* <Route path="/ivr" element={<IVR />} /> */}
          <Route path="/ocr" element={<Ocr />} />
          <Route path="/" element={<OnboardingCarousel />} />

          <Route
            path="/auth/register"
            element={
              <AuthRoute>
                <SignUpForm />
              </AuthRoute>
            }
          />
          <Route
            path="/auth/login"
            element={
              <AuthRoute>
                <LoginForm />
              </AuthRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route
              path="document-summarizer"
              element={<DocumentSummarizer />}
            />
            <Route path="accept-invitation" element={<InvitationPage />} />
            <Route path="compare" element={<LawComparison />} />
            <Route path="ai" element={<SearchScreen />} />
            <Route path="ai/consent" element={<ConsentUI />} />
            <Route path="ai/ask" element={<Genai />} />
            <Route path="ai/fam" element={<ReviewPage />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="test" element={<AudioRecorder />} />
            <Route path="community" element={<GroupPage />} />
            <Route path="editor" element={<PhotoEditor />} />
            <Route path="templates" element={<Templates />} />
            <Route
              path="templates/nondisclosure"
              element={<SimplePartnershipDeed />}
            />
            <Route path="templates/copyright" element={<Copyright />} />
          </Route>

          <Route
            path="story/:id"
            element={
              <ProtectedRoute>
                <Story />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ipfs"
            element={
              <ProtectedRoute>
                <IPFSUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/news"
            element={
              <ProtectedRoute>
                <News />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
}
