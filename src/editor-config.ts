import type * as THREE from "three/webgpu";
import type { ExportProject, ExportEmitterConfig, ParticlesConfig } from "./types";

/**
 * Builder class for loading and configuring particle systems from editor exports.
 *
 * @example
 * ```ts
 * import { EditorConfig, Particles } from '@threeparticles/core'
 * import data from './my-project-threeparticles.json'
 *
 * const config = EditorConfig.load(data)
 *   .project('MyProject')
 *   .emitter('fire')
 *   .onImage((path) => loader.load(path))
 *   .build()
 *
 * const particles = new Particles(config)
 * ```
 */
export class EditorConfig {
  private data: ExportProject[];
  private selectedProject: ExportProject | null = null;
  private emitterConfig: ExportEmitterConfig | null = null;
  private imageResolver: ((path: string) => THREE.Texture) | null = null;

  private constructor(data: ExportProject[]) {
    this.data = data;
  }

  /** Load editor export JSON data */
  static load(data: ExportProject[]): EditorConfig {
    return new EditorConfig(data);
  }

  /** Select a project by ID */
  project(projectId: string): EditorConfig {
    const project = this.data.find((p) => p.id === projectId);
    if (!project) {
      throw new Error(`Project "${projectId}" not found in export`);
    }
    this.selectedProject = project;
    return this;
  }

  /** Select an emitter by ID */
  emitter(emitterId: string): EditorConfig {
    if (!this.selectedProject) {
      throw new Error("No project selected. Call project() first.");
    }
    const emitter = this.selectedProject.configs.find((c) => c.id === emitterId);
    if (!emitter) {
      throw new Error(`Emitter "${emitterId}" not found in project "${this.selectedProject.id}"`);
    }
    this.emitterConfig = emitter;
    return this;
  }

  /** Set texture resolver for loading alpha map images */
  onImage(resolver: (path: string) => THREE.Texture): EditorConfig {
    this.imageResolver = resolver;
    return this;
  }

  /** Build the final ParticlesConfig */
  build(): ParticlesConfig {
    if (!this.emitterConfig) {
      throw new Error("No emitter selected. Call project() and emitter() first.");
    }

    const { particles: exportParticles, render, emitter } = this.emitterConfig;

    return {
      particles: {
        ...exportParticles,
        alphaMapsStart: this.resolveTextures(exportParticles.alphaMapsStart),
        alphaMapsEnd: this.resolveTextures(exportParticles.alphaMapsEnd),
      },
      render,
      emitter,
    };
  }

  private resolveTextures(paths: string[] | undefined): THREE.Texture[] | undefined {
    if (!this.imageResolver || !paths) return undefined;
    return paths.map(this.imageResolver);
  }

  /** Get the position offset from the editor (if set) */
  get position(): [number, number, number] | undefined {
    return this.emitterConfig?.position;
  }
}
