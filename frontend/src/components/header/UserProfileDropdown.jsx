// src/components/header/UserProfileDropdown.jsx
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { Menu, Transition } from '@headlessui/react';
import { LogOut, User, Settings, ChevronsUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

const UserProfileDropdown = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <Menu as="div" className="relative">
            <Menu.Button as={motion.button} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                className="flex items-center gap-3 p-1.5 rounded-full hover:bg-secondary/10 transition-colors border border-light-gray/50"
            >
                <div className="w-9 h-9 flex-shrink-0 rounded-full border border-light-gray/50 bg-secondary/10 flex items-center justify-center font-bold text-primary">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="font-bold text-sm text-text-title truncate">{user.username}</p>
                    <p className="text-xs text-accent capitalize">{user.role}</p>
                </div>
                <ChevronsUpDown size={16} className="text-text-secondary hidden sm:block" />
            </Menu.Button>

            <Transition 
                as={Fragment} 
                enter="transition ease-out duration-100" 
                enterFrom="transform opacity-0 scale-95" 
                enterTo="transform opacity-100 scale-100" 
                leave="transition ease-in duration-75" 
                leaveFrom="transform opacity-100 scale-100" 
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-surface backdrop-blur-xl border border-light-gray shadow-lg focus:outline-none">
                    <div className="p-2">
                        <div className="px-2 py-2 mb-1 border-b border-light-gray/50">
                            <p className="font-bold text-text-main text-sm">Masuk sebagai</p>
                            <p className="text-xs text-accent truncate">{user.username}</p>
                        </div>
                        
                        {/* PERBAIKAN: Link 'Profil' ditambahkan kembali */}
                        <Menu.Item>
                            {({ active }) => (
                                <Link to="/profil" className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-semibold ${active ? 'bg-secondary/10 text-primary' : 'text-text-main'}`}>
                                    <User className="mr-2 h-5 w-5" />
                                    Profil
                                </Link>
                            )}
                        </Menu.Item>

                        <Menu.Item>
                            {({ active }) => (
                                <Link to="/pengaturan" className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-semibold ${active ? 'bg-secondary/10 text-primary' : 'text-text-main'}`}>
                                    <Settings className="mr-2 h-5 w-5" />
                                    Pengaturan
                                </Link>
                            )}
                        </Menu.Item>
                        
                        <div className="w-full h-px bg-light-gray/50 my-1"></div>
                        
                        <Menu.Item>
                            {({ active }) => (
                                <button onClick={logout} className={`group flex items-center rounded-md px-2 py-2 text-sm font-semibold w-full ${active ? 'bg-error/10 text-error' : 'text-error'}`}>
                                    <LogOut className="mr-2 h-5 w-5" />
                                    Logout
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};
export default UserProfileDropdown;