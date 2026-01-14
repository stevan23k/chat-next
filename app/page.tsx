"use client";
import { chatStore } from "@/src/store/chatStore";
import { LuSend } from "react-icons/lu";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useEffect, useRef, useState } from "react";
export default function Home() {
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    isTyping(true);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      isTyping(false);
    }, 1000);
  };

  const [text, setText] = useState("");

  const { isTyping, typing } = chatStore((state) => state);
  const { connect, disconnect, connected } = chatStore((state) => state);
  const { mensajes, user: myUserId, sendMessage } = chatStore((state) => state);

  const submit = () => {
    if (!text.trim()) return;

    setTimeout(() => {
      const lastMessage = messagesContainerRef.current?.lastElementChild?.previousElementSibling;

      if (lastMessage) {
        gsap.fromTo(
          lastMessage,
          {
            opacity: 0,
            y: 10,
            scale: 0.7,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.inOut",
          },
        );
      }
    }, 20);

    sendMessage(text);
    setText("");
    isTyping(false);
  };


  console.log(mensajes, typing, connected);

  // conexion a el socket
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  // Scroll automático cuando cambian los mensajes o el estado de typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // animacion de scroll
  useEffect(() => {
    gsap.to(messagesContainerRef.current, {
      scrollTop: messagesContainerRef.current?.scrollHeight,
      duration: 0.5,
      ease: "power2.inOut",
    });
  }, [mensajes]);

  // animacion de typing
  useEffect(() => {

    if (!typingRef.current) return;

    gsap.killTweensOf(typingRef.current)

    if (typing) {
      gsap.set(typingRef.current, { display: "flex"})
      gsap.fromTo(
        typingRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      ); 
    }
    else {
      gsap.to(typingRef.current, {
        opacity: 0,
        y: 8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(typingRef.current, {  display: "none"})
        }

      })
    }

  }, [typing]);

  // animacion de llegada de mensajes
  useEffect(() => {
    // Nada que animar si no hay mensajes
    if (!mensajes.length) return;
    if (!messagesContainerRef.current) return;

    // Todos los mensajes de "otro"
    const otherMessages = messagesContainerRef.current.querySelectorAll<
      HTMLDivElement
    >('div[data-message="other"]');

    const lastOtherMessage = otherMessages[otherMessages.length - 1];
    if (!lastOtherMessage) return;

    // Animación de entrada (slide + fade)
    gsap.fromTo(
      lastOtherMessage,
      {
        opacity: 0,
        x: 30,
        scale: 0.70,
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
      }
    );
  }, [mensajes]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="w-full max-w-4xl h-[700px] bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/90 p-5 shadow-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                Chat
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${connected ? "bg-slate-400 animate-pulse" : "bg-slate-600"}`}
                ></div>
                <p className="text-slate-400 text-sm font-medium">
                  {connected ? "Conectado" : "Desconectado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div
          data-scroll-trigger="true"
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          style={{ scrollbarWidth: "thin" }}
        >
          {mensajes.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
                  <LuSend className="text-slate-400 text-2xl" />
                </div>
                <p className="text-slate-400 text-sm">No hay mensajes aún</p>
                <p className="text-slate-500 text-xs mt-1">
                  Comienza una conversación
                </p>
              </div>
            </div>
          )}

          {mensajes.map((mensaje, index) => {
            const isMine = mensaje.user === myUserId;

            return (
              <div
                key={index}
                data-message={isMine ? "me" : "other"}
                className={`flex items-end gap-3 ${isMine ? "justify-end" : "justify-start"} group`}
              >
                {!isMine && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 text-xs font-semibold flex-shrink-0 mb-1 border border-slate-600/50">
                    {mensaje.user?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-5 py-3 rounded-3xl shadow-xl transition-all duration-200 group-hover:shadow-2xl ${isMine
                    ? "bg-slate-700 text-slate-100 rounded-br-md border border-slate-600/30"
                    : "bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-md backdrop-blur-sm"
                    }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {mensaje.mensaje}
                  </p>
                </div>
                {isMine && (
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-200 text-xs font-semibold flex-shrink-0 mb-1 border border-slate-500/50">
                    {myUserId?.charAt(0).toUpperCase() || "T"}
                  </div>
                )}
              </div>
            );
          })}
          
            {/* item de typing */}
          
            <div ref={typingRef} className="flex items-end gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 text-xs font-semibold flex-shrink-0 mb-1 border border-slate-600/50">
                ?
              </div>
              <div  className="bg-slate-800/80 text-slate-100 px-5 py-3 rounded-3xl rounded-bl-md border border-slate-700/50 shadow-xl backdrop-blur-sm">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1 ml-1">
                    <div
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div
          ref={inputContainerRef}
          className="p-5 bg-slate-900/90 border-t border-slate-800/50 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submit();
                }
              }}
              onChange={handleChange}
              value={text}
              className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 transition-all duration-200 text-sm"
              type="text"
              placeholder="Escribe un mensaje..."
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="cursor-pointer bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-100 p-3.5 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center min-w-[44px] border border-slate-600/30"
              type="submit"
            >
              <LuSend className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
