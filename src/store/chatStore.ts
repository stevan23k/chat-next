import { create } from "zustand";
import { Socket, io } from "socket.io-client";

interface mensajes {
  mensaje: string;
  user: string;
}


interface chatState {
  socket: Socket | null;
  connect: () => void;
  connected: boolean;
  mensajes: mensajes[];
  mensaje: string;
  typing: boolean;
  isTyping: (value: boolean) => void
  sendMessage: (value: string) => void;
  addMensaje: (msg: mensajes) => void;
  disconnect: () => void
  user: string
}


export const chatStore = create<chatState>((set, get) => ({
  socket: null,
  connected: false,
  mensajes: [],
  typing: false,
  mensaje: "",
  user: '',

  isTyping: (value) => {
    const socket = get().socket;
    if (!socket) return
    socket.emit("typing", value)
  },

  sendMessage: (text: string) => {
    const socket = get().socket;
    if (!socket) return;

    socket.emit("mensaje", {
      mensaje: text,
    });
  },

  connect: () => {
    if (get().socket) return;

    const socket = io("http://localhost:3000/");

    socket.on("connect", () => {
      set({ connected: true, user: socket.id });
    });

    socket.on("disconnect", () => {
      set({ connected: false });
    });

    socket.on("mensaje", (msg: { mensaje: string, user: string }) => {
      get().addMensaje(msg);
    });

    socket.on("typing", (value: boolean) => {
      set({ typing: value })
    })

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, connected: false });
  },

  addMensaje: (msg) =>
    set((state) => ({
      mensajes: [...state.mensajes, msg],
    })),
}));
