import React from 'react';

const POAPsSection = () => {
  return (
    <section className="py-12 sm:py-16 relative bg-gradient-to-br from-[#0055B3] to-[#030F1C]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[1000px] md:min-h-[900px]">
            {/* Top Left - POAP Feature */}
            <div className="p-8 lg:p-12 flex flex-col justify-center min-h-[400px] md:min-h-[450px]">
              <div className="text-[#E4F1FF]">
                <h3 className="text-2xl sm:text-3xl lg:text-6xl font-semibold mb-6 leading-tight">
                  Add POAPs to Your <br /> Events
                </h3>
                
                <p className="text-[#E4F1FF] font-normal mb-8 text-base sm:text-lg lg:text-xl opacity-90 leading-relaxed">
                  Reward attendees with Proof of Attendance Protocol (POAP) NFTs for joining your event.
                </p>
                <button className="text-[#E4F1FF] font-normal border border-[#E4F1FF] px-6 py-2 rounded-lg text-sm sm:text-base" onClick={() => window.location.href = '/create'}>
                  Create an event
                </button>
              </div>
            </div>

            {/* Top Right - POAP Image */}
            <div className="bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center min-h-[400px] md:min-h-[450px] flex-1">
              <img
                src="suicoinn.png"
                alt="POAP feature"
                className="w-full object-contain drop-shadow-lg rounded-lg"
              />
            </div>
    
            {/* Bottom Left - Grant Tracking Image */}
            <div className="bg-gradient-to-br from-[#FDDD65] to-[#69B664] flex items-center justify-center min-h-[400px] md:min-h-[450px] flex-1">
              <img
                src="/granttracking.png"
                alt="Grantfeature"
                className="max-w-[70%] max-h-[70%] object-contain drop-shadow-lg rounded-lg"
              />
            </div>

            {/* Bottom Right - Grant Tracking Feature */}
            <div className="p-8 lg:p-12 flex flex-col justify-center min-h-[400px] md:min-h-[450px]">
              <div className="text-white">
                <h3 className="text-2xl sm:text-3xl lg:text-6xl font-semibold mb-6 leading-tight">
                  Bounty & Grant  <br /> Tracking for Leads
                </h3>
                <p className="text-gray-300 font-normal mb-8 text-base sm:text-lg lg:text-2xl opacity-90 leading-relaxed">
                  Community leads can easily track bounties, report progress, and manage grants in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default POAPsSection;