import React, { useState } from 'react';
import { Person } from '../types';
import { UserGroupIcon } from './Icons';

interface OnboardingModalProps {
    onComplete: (person: Person) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            const selfPerson: Person = {
                id: Date.now().toString(),
                name: name.trim(),
                primaryRelationship: "Unknown/Unclassified", // 'You' node is special
                relationships: [],
                tags: ['me'],
                aliases: [],
                location: '',
                notes: 'This is the root node representing the user.'
            };
            onComplete(selfPerson);
        }
    };

    return (
        <div className="fixed inset-0 bg-brand-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-brand-surface rounded-lg shadow-2xl p-8 text-center">
                <UserGroupIcon className="w-20 h-20 mx-auto text-brand-accent mb-4" />
                <h1 className="text-3xl font-bold text-brand-text-primary">Welcome to People's Tree!</h1>
                <p className="text-brand-text-secondary mt-2 mb-6">
                    Let's start by creating a node for yourself. This will be the center of your relationship map.
                </p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name" className="sr-only">Your Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        required
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full mt-6 px-4 py-3 font-bold text-white bg-brand-accent rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingModal;