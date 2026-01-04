"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Loader2,
  Sparkles,
  Send,
  Instagram,
  AlertTriangle,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toPng } from "html-to-image";
import download from "downloadjs";
import axios from "axios";

const API_URL = "http://localhost:3333/api/v1/marketing/posts/draft";

type GenerateDraftPayload = {
  topic: string;
  tone: string;
  legalArea: string;
};

export default function EditorPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Sóbrio");
  const [legalArea, setLegalArea] = useState("Civil");

  // Referência para o elemento HTML que vai virar imagem
  const postRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: async (data: GenerateDraftPayload) => {
      const response = await axios.post(API_URL, data, {
        headers: { "x-tenant-id": "tenant-1" },
      });
      return response.data;
    },
  });

  const generatedPost = mutation.data;

  // Função que transforma o HTML em PNG
  const handleDownload = async () => {
    if (!postRef.current) return;

    try {
      const dataUrl = await toPng(postRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Alta resolução (3x)
        backgroundColor: "#0f172a", // Cor de fundo do post
      });
      download(dataUrl, "post-juridico.png");
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* --- SIDEBAR DE CONTROLE --- */}
      <aside className="w-[400px] border-r bg-white flex flex-col shadow-xl z-20">
        <div className="p-8 border-b bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-amber-500 fill-amber-500" size={20} />
            Editor Jurídico
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sua agência de marketing pessoal.
          </p>
        </div>

        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Pauta do Dia
            </label>
            <Textarea
              placeholder="Ex: STF decide que é inconstitucional a revisão da vida toda..."
              className="h-32 resize-none focus:ring-slate-900 bg-slate-50 border-slate-200 text-base"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              Descreva o fato ou cole uma notícia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Área
              </label>
              <Select value={legalArea} onValueChange={setLegalArea}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Civil">Direito Civil</SelectItem>
                  <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                  <SelectItem value="Criminal">Criminal</SelectItem>
                  <SelectItem value="Tributario">Tributário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Tom
              </label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sóbrio">Sóbrio</SelectItem>
                  <SelectItem value="Combatiivo">Combativo</SelectItem>
                  <SelectItem value="Empatico">Empático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50/50 flex flex-col gap-3">
          <Button
            className="w-full h-12 text-lg font-medium bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
            disabled={!topic || mutation.isPending}
            onClick={() => mutation.mutate({ topic, tone, legalArea })}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Criando Rascunho...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                1. Gerar Post com IA
              </>
            )}
          </Button>

          {/* Botão de Download só aparece se tiver post */}
          {generatedPost && (
            <Button
              variant="outline"
              className="w-full h-12 text-lg border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-5 w-5" />
              2. Baixar Imagem (PNG)
            </Button>
          )}
        </div>
      </aside>

      {/* --- PREVIEW ÁREA --- */}
      <main className="flex-1 flex items-center justify-center bg-slate-100 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

        {!generatedPost && !mutation.isPending && (
          <div className="text-center text-slate-400 max-w-md p-8 border-2 border-dashed border-slate-300 rounded-xl">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-600">
              Aguardando Pauta
            </h3>
            <p>Preencha os dados ao lado para visualizar a mágica.</p>
          </div>
        )}

        {(generatedPost || mutation.isPending) && (
          <div className="scale-90 md:scale-100 transition-all duration-500">
            <div className="w-[375px] h-[750px] bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden flex flex-col relative ring-4 ring-slate-900/10">
              {/* Header Instagram */}
              <div className="h-14 border-b flex items-center justify-between px-5 bg-white z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 to-amber-500 border border-white shadow-sm"></div>
                  <span className="text-xs font-semibold text-slate-900">
                    advocacia.digital
                  </span>
                </div>
                <Instagram className="h-5 w-5 text-slate-800" />
              </div>

              {/* POST CONTENT */}
              <div className="flex-1 overflow-y-auto bg-white scrollbar-hide">
                {/* --- AQUI É O ELEMENTO QUE VAI VIRAR IMAGEM --- */}
                <div
                  ref={postRef}
                  className="aspect-square bg-slate-900 relative overflow-hidden"
                >
                  {mutation.isPending ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 animate-pulse text-white">
                      Gerando Design...
                    </div>
                  ) : (
                    // TEMPLATE VISUAL (Isso vira o PNG)
                    <div className="w-full h-full flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white relative">
                      {/* Marca d'água / Logo */}
                      <div className="absolute top-8 right-8 w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center">
                        <span className="font-serif text-xl">M</span>
                      </div>

                      <div className="mt-8 relative z-10">
                        <span className="inline-block px-3 py-1 bg-amber-500 text-black text-[10px] font-bold tracking-widest uppercase rounded mb-4">
                          {legalArea}
                        </span>
                        <h1 className="text-3xl font-serif leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                          {generatedPost.headline}
                        </h1>
                      </div>

                      <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest">
                          Informativo Jurídico
                        </div>
                        <div className="text-[10px] text-white font-bold">
                          @seuescritorio
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* --------------------------------------------- */}

                {/* Ações */}
                <div className="px-4 py-3 flex gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-900"></div>
                  <Send className="h-6 w-6 text-slate-900" />
                </div>

                {/* Legenda */}
                <div className="px-4 pb-8">
                  <div className="text-xs font-semibold mb-1">243 curtidas</div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    <span className="font-bold text-slate-900 mr-2">
                      advocacia.digital
                    </span>
                    {mutation.isPending ? (
                      <span className="animate-pulse bg-slate-200 text-transparent rounded">
                        Gerando legenda otimizada para o algoritmo...
                      </span>
                    ) : (
                      generatedPost.caption
                    )}
                  </p>

                  {/* Alerta de Compliance */}
                  {generatedPost?.complianceCheck?.passed === false && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 items-start">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-red-700">
                          Risco Ético (OAB)
                        </h4>
                        <p className="text-[10px] text-red-600 leading-tight mt-1">
                          Este post contém termos que podem ser considerados
                          mercantilização. Revise antes de postar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
