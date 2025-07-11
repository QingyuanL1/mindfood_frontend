import React from 'react';
import { Users, Trophy, Target } from 'lucide-react';

const TeamPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Team Progress</h1>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Team Members</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Team Goals Met</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Active Challenges</h3>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        <div className="space-y-4">
          {/* Placeholder when no team members exist */}
          <div className="text-center text-gray-500 py-8">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No team members yet</p>
            <p className="text-sm">Invite friends to join your team</p>
            <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Invite Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage; 