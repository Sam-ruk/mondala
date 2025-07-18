import React from 'react';
import { X } from 'lucide-react';

interface TipsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Tip {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  isImageLeft: boolean;
}

const tips: Tip[] = [
  {
    id: 1,
    title: "Rings",
    description: "Use the ring control to change the no. of rings on the canvas. Keep the layers upto 2 and your designs simple to prevent avoid incuring heavy gas fees and failing TXs.",
    videoUrl: "/videos/rings.mp4",
    isImageLeft: true
  },
  {
    id: 2,
    title: "Active Ring",
    description: "Select the ring you want to draw in. Keep your designs simple, use less strokes.",
    videoUrl: "/videos/active_rings.mp4",
    isImageLeft: false
  },
  {
    id: 3,
    title: "Clear Selected Ring",
    description: "Clear the active ring using this control. Or use Clear canvas to erase the entire drawing.",
    videoUrl: "/videos/clear_rings.mp4",
    isImageLeft: true
  },
  {
    id: 4,
    title: "Colors",
    description: "Choose the pen color you want to draw with.",
    videoUrl: "/videos/colors.mp4",
    isImageLeft: false
  },
  {
    id: 5,
    title: "Symmetry",
    description: "Select the no. of times you want your drawing to be mirrored.",
    videoUrl: "/videos/symmetry.mp4",
    isImageLeft: true
  },
  {
    id: 6,
    title: "Pen Size",
    description: "Select the thickness of the pen.",
    videoUrl: "/videos/pen_size.mp4",
    isImageLeft: false
  },
  {
    id: 7,
    title: "Vibe",
    description: "Select the audio you want to play in the background and make you drawing vibe to it.",
    videoUrl: "/videos/vibe.mp4",
    isImageLeft: true
  },
  {
    id: 8,
    title: "Sensitivity",
    description: "Control the rotation sensitivity of the vibing art wrt the amplitude of your selected music.",
    videoUrl: "/videos/sensitivity.mp4",
    isImageLeft: false
  },
  {
    id: 9,
    title: "Hide",
    description: "Hide the toolbox and enjoy the vibing art!",
    videoUrl: "/videos/hide.mp4",
    isImageLeft: true
  },
  {
    id: 10,
    title: "Wallet Connection",
    description: "Connect your wallet to be able to mint your drawing as an on-chain svg NFT.",
    videoUrl: "/videos/connection.mp4",
    isImageLeft: false
  },
  {
    id: 11,
    title: "Save & Mint",
    description: "Download your drawing as an SVG + mint it as an 100% on-chain NFT.",
    videoUrl: "/videos/minting.mp4",
    isImageLeft: true
  }
];

const TipsDialog: React.FC<TipsDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-br from-purple-900/95 to-purple-800/95 rounded-2xl shadow-2xl border border-purple-500/30">
        <style>
          {`
            @layer utilities {
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(76, 29, 149, 0.3); /* Purple-900 with opacity */
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #a855f7; /* Purple-500 */
                border-radius: 4px;
                box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #c084fc; /* Purple-400 */
              }
            }
          `}
        </style>

        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-purple-900 to-purple-800 rounded-t-2xl border-b border-purple-500/30">
          <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'cursive' }}>
            Mondala 
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-purple-300 transition-colors rounded-full hover:bg-purple-700/50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)] md:custom-scrollbar">
          <div className="p-6 space-y-8">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-gradient-to-br from-purple-800/50 to-purple-700/50 border border-purple-500/20 backdrop-blur-sm ${
                  tip.isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-shrink-0 w-full md:w-1/2 max-w-sm">
                  <div className="relative rounded-lg overflow-hidden border border-purple-500/30 shadow-lg">
                    <video
                      key={tip.id}
                      src={tip.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                    >
                      <source src={tip.videoUrl} type="video/mp4" />
                    </video>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3" style={{ fontFamily: 'cursive' }}>
                    {tip.title}
                  </h3>
                  <p className="text-purple-100 leading-relaxed text-base sm:text-lg opacity-90" style={{ fontFamily: 'cursive' }}>
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 p-4 sm:p-6 bg-gradient-to-r from-purple-900 to-purple-800 rounded-b-2xl border-t border-purple-500/30">
          <p className="text-center text-purple-200 text-base sm:text-lg" style={{ fontFamily: 'cursive' }}>
            Built with 💜 by <a href="https://x.com/Samruddhi_Krnr" target="_blank">Samk</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TipsDialog;