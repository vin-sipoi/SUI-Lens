'use client'

import React, { useRef, useState } from 'react';
import Header from '../../components/Header';
import { CloudUpload } from 'lucide-react';

const CreateCommunityPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Header />
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center">
        <form className="bg-white border border-gray-200 rounded-2xl shadow p-8 w-full max-w-lg flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-center mb-1">Create a New Community</h2>
          <p className="text-[#8C94A6] text-center mb-2 -mt-2">Fill out these details to build your community</p>

          {/* Community Name */}
          <div>
            <label className="block text-sm font-medium text-[#475367] mb-1">Community Name / Title</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4592E6]" />
          </div>

          {/* Community Description */}
          <div>
            <label className="block text-sm font-medium text-[#475367] mb-1">Community Description</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[80px]" placeholder="Tell us about your community" />
            <span className="text-sm text-[#667185] mt-1 block">Keep this simple of 50 character</span>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-[#475367] mb-2">Upload a community banner image</label>
            <div className="border border-gray-200 rounded-xl bg-[#F8FAFC] flex flex-col items-center justify-center py-6 px-4 mb-2">
              <input
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/gif"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center">
                <CloudUpload className='mb-6'/>
                <p className='text-sm text-[#475367] font-normal'>
                  <span className="text-[#4DA2FF] text-sm font-semibold cursor-pointer" onClick={handleBrowseClick}>Click to upload banner </span>
                  or drag and drop
                </p>
                <span className="text-xs text-gray-400 mt-1 font-normal">SVG, PNG, JPG or GIF (max. 800×400px)</span>
              </div>
              <div className="w-full flex flex-col items-center justify-center mt-6 gap-4">
                <span className="text-gray-400 text-xs mr-2">OR</span>
                <button type="button" className="bg-[#4DA2FF] text-white px-4 py-2 rounded-xl text-sm font-semibold" onClick={handleBrowseClick}>Browse Files</button>
                {selectedFile && (
                  <span className="text-xs text-blue-600 mt-2">Selected: {selectedFile.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full bg-[#F0F6FF] text-[#A0AEC0] font-semibold py-3 rounded-lg mt-2 cursor-not-allowed" disabled>
            Create Community
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateCommunityPage;