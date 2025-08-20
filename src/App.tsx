import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { AuthRoute } from "@/components/AuthRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Calendario from "./pages/Calendario";
import Relatorios from "./pages/Relatorios";
import Clientes from "./pages/Clientes";
import Empresas from "./pages/Empresas";
import Locais from "./pages/Locais";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route 
      path="/auth" 
      element={
        <AuthRoute>
          <Auth />
        </AuthRoute>
      } 
    />
    
    {/* Rotas protegidas por papel */}
    <Route 
      path="/dashboard" 
      element={
        <RoleProtectedRoute allowedRoles={['admin', 'cliente']}>
          <Dashboard />
        </RoleProtectedRoute>
      } 
    />
    
    <Route 
      path="/calendario" 
      element={
        <RoleProtectedRoute allowedRoles={['admin', 'cliente']}>
          <Calendario />
        </RoleProtectedRoute>
      } 
    />
    
    <Route 
      path="/relatorios" 
      element={
        <RoleProtectedRoute allowedRoles={['admin', 'cliente']}>
          <Relatorios />
        </RoleProtectedRoute>
      } 
    />
    
    <Route 
      path="/clientes" 
      element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <Clientes />
        </RoleProtectedRoute>
      } 
    />
    
    <Route 
      path="/empresas" 
      element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <Empresas />
        </RoleProtectedRoute>
      } 
    />
    
    <Route 
      path="/locais" 
      element={
        <RoleProtectedRoute allowedRoles={['admin', 'cliente']}>
          <Locais />
        </RoleProtectedRoute>
      } 
    />
    
    <Route 
      path="/usuarios" 
      element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <Usuarios />
        </RoleProtectedRoute>
      } 
    />
    
    <Route 
      path="/configuracoes" 
      element={
        <RoleProtectedRoute allowedRoles={['admin']}>
          <Configuracoes />
        </RoleProtectedRoute>
      } 
    />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
