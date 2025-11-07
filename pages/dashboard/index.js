'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  FiHome,
  FiBriefcase,
  FiFileText,
  FiMessageSquare,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';

const menuItems = [
  {
    title: 'Principal',
    icon: FiHome,
    url: '/dashboard',
  },
  {
    title: 'Vacantes',
    icon: FiBriefcase,
    url: '/dashboard/vacantes',
  },
  {
    title: 'Analizar CV',
    icon: FiFileText,
    url: '/dashboard/analizar-cv',
  },
  {
    title: 'Simular Entrevista',
    icon: FiMessageSquare,
    url: '/dashboard/entrevista',
  },
  {
    title: 'Perfil',
    icon: FiUser,
    url: '/dashboard/perfil',
  },
];

function AppSidebar() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('Principal');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    router.push('/');
  };

  const handleNavigation = (item) => {
    setActiveItem(item.title);
    router.push(item.url);
  };

  return (
    <Sidebar className="border-none bg-white">
      <SidebarHeader className="h-20 border-b border-gray-200 px-6 bg-gradient-to-br from-[#0a6448] to-[#0f2755]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <FiUser className="w-5 h-5 text-[#0a6448]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-white drop-shadow-sm">Usuario</p>
            <p className="text-xs text-white/90">Estudiante UTC</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = activeItem === item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item)}
                      isActive={isActive}
                      tooltip={item.title}
                      className={`
                        group relative rounded-xl px-4 py-3 transition-all duration-200 font-medium
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#0a6448] to-[#0f2755] shadow-lg shadow-[#0a6448]/25' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-[#0a6448]'
                        }
                      `}
                      style={isActive ? { color: '#ffffff' } : undefined}
                    >
                      <item.icon 
                        className={`w-5 h-5 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}
                        style={isActive ? { color: '#ffffff' } : undefined}
                      />
                      <span className="text-sm" style={isActive ? { color: '#ffffff' } : undefined}>
                        {item.title}
                      </span>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm"></div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 p-4 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="group rounded-xl px-4 py-3 transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium"
            >
              <FiLogOut className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-sm">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Verificar si hay token en localStorage
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      // Si no hay token, redirigir al home
      router.push('/');
    } else {
      setToken(accessToken);
    }
  }, [router]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a6448]/5 to-[#0f2755]/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a6448] mx-auto mb-4"></div>
          <p className="text-[#0f2755] font-medium">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#0a6448]/5 via-white to-[#0f2755]/5">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#0a6448]/20 bg-white/80 backdrop-blur-sm px-6">
            <SidebarTrigger className="text-[#0f2755] hover:text-[#0a6448]" />
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#0a6448] to-[#0f2755] bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
          </header>
          
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
            <div className="relative">
              <Image
                src="/images/logo_main.png"
                alt="UTC Link Logo"
                width={600}
                height={600}
                className="opacity-20 select-none"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-[#0a6448] to-[#0f2755] bg-clip-text text-transparent">
                    {/* Bienvenido a UTC Link */}
                  </h2>
                  <p className="text-[#0f2755]/70 text-lg">
                    {/* Selecciona una opción del menú para comenzar */}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
