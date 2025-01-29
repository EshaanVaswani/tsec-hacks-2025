import { GeistSans } from "geist/font/sans";
import "./globals.css";
import ChatSupport from "@/components/chat/chat-support";





export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <div lang="en">
      <div className={GeistSans.className}>
        
          <div className="flex flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">

            <div className="z-10 border rounded-lg max-w-5xl w-full h-full text-sm flex">
              {/* Page content */}
              {children}
            </div>

            {/* Footer */}
            <div className="flex justify-between max-w-5xl w-full items-start text-xs md:text-sm text-muted-foreground ">
              <p className="max-w-[150px] sm:max-w-lg">
                Built by{" "}
                <a
                  className="font-semibold"
                  href="https://github.com/jakobhoeg/"
                >
                  Jakob Hoeg
                </a>
                . Check out the{" "}
                <a
                  className="font-semibold"
                  href="https://docs-shadcn-chat.vercel.app/"
                >
                  documentation
                </a>
                to get started.
              </p>
              <p className="max-w-[150px] sm:max-w-lg text-right">
                Source code available on{" "}
                <a
                  className="font-semibold"
                  href="https://github.com/jakobhoeg/shadcn-chat"
                >
                  GitHub
                </a>
                .
              </p>
            </div>

            {/* Chat support component */}
            <ChatSupport />
          </div>

      </div>
    </div>
  );
}
