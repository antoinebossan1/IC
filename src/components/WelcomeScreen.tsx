import React from "react";

interface WelcomeScreenProps {
  onOpenSettings: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenSettings,
}) => {
  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-black border border-white/10 rounded-xl p-6 shadow-lg">
        <div className="mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
            <h3 className="text-white/90 font-medium mb-2">Global Shortcuts</h3>
            <ul className="space-y-2">
              <li className="flex justify-between text-sm">
                <span className="text-white/70">Toggle Visibility</span>
                <span className="text-white/90">Ctrl+B / Cmd+B</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">Take Screenshot</span>
                <span className="text-white/90">Ctrl+H / Cmd+H</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">Delete Last Screenshot</span>
                <span className="text-white/90">Ctrl+L / Cmd+L</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">Process Screenshots</span>
                <span className="text-white/90">Ctrl+Enter / Cmd+Enter</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">Reset View</span>
                <span className="text-white/90">Ctrl+R / Cmd+R</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-white/70">Quit App</span>
                <span className="text-white/90">Ctrl+Q / Cmd+Q</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
