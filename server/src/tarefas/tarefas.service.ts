import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tarefa, TarefaDocument } from './tarefas.schema';
import { Projeto, ProjetoDocument } from '../projetos/projetos.schema';
import { CreateTarefaDto } from './dto/create-tarefa.dto';
import { TarefaStep, TarefaStepDocument } from './tarefas-step.schema';
import { TarefaType, TarefaTypeDocument } from './tarefas-type.schema';
import { CreateTarefaStepDto } from './dto/create-tarefa-step.dto';
import { UpdateTarefaStepDto } from './dto/update-tarefa-step.dto';
import { CreateTarefaTypeDto } from './dto/create-tarefa-type.dto';
import { UpdateTarefaTypeDto } from './dto/update-tarefa-type.dto';

@Injectable()
export class TarefasService {
  constructor(
    @InjectModel(Tarefa.name) private tarefaModel: Model<TarefaDocument>,
    @InjectModel(TarefaType.name)
    private tarefaTypeModel: Model<TarefaTypeDocument>,
    @InjectModel(Projeto.name) private projetoModel: Model<ProjetoDocument>,
    @InjectModel(TarefaStep.name)
    private tarefaStepModel: Model<TarefaStepDocument>,
  ) {}

  // ------------------ TAREFAS ------------------

  async createTarefa(createTarefaDto: CreateTarefaDto): Promise<Tarefa> {
    const projeto = await this.projetoModel
      .findById(createTarefaDto.projetoId)
      .exec();

    if (!projeto) {
      throw new BadRequestException('Projeto não encontrado.');
    }

    const data: any = {
      ...createTarefaDto,
    };

    if ((createTarefaDto as any).stepId) {
      data.step = (createTarefaDto as any).stepId;
    }

    const createdTarefa = new this.tarefaModel(data);
    return createdTarefa.save();
  }

  async getTarefa(tarefaId: string) {
    return this.tarefaModel.findById(tarefaId).populate('projetoId').exec();
  }

  async getTarefas(projetoId: string): Promise<Tarefa[]> {
    return this.tarefaModel.find({ projetoId }).exec();
  }

  async getKanbanByProjeto(projetoId: string) {
    const steps = await this.tarefaStepModel
      .find({ projetoId })
      .sort({ order: 1, _id: 1 })
      .lean()
      .exec();

    const tarefas = await this.tarefaModel
      .find({ projetoId })
      .lean()
      .populate('typeId')
      .exec();

    const tarefasByStepId = new Map<string, any[]>();

    for (const tarefa of tarefas) {
      const stepKey = tarefa.stepId ? tarefa.stepId.toString() : 'backlog';

      if (!tarefasByStepId.has(stepKey)) {
        tarefasByStepId.set(stepKey, []);
      }

      tarefasByStepId.get(stepKey)!.push(tarefa);
    }

    const stepsResult = steps.map((step) => ({
      _id: step._id,
      name: step.name,
      color: step.color,
      order: step.order,
      tarefas: tarefasByStepId.get(step._id.toString()) ?? [],
    }));

    const backlogStep = {
      _id: null,
      name: 'Backlog',
      color: null,
      order: -1,
      tarefas: tarefasByStepId.get('backlog') ?? [],
    };

    return {
      steps: [backlogStep, ...stepsResult],
    };
  }

  // ------------------ STEPS ------------------

  async createStep(dto: CreateTarefaStepDto): Promise<TarefaStep> {
    const projeto = await this.projetoModel.findById(dto.projetoId).exec();
    if (!projeto) {
      throw new BadRequestException('Projeto não encontrado para o step.');
    }

    const step = new this.tarefaStepModel(dto);
    return step.save();
  }

  async getStepsByProjeto(projetoId: string): Promise<TarefaStep[]> {
    return this.tarefaStepModel
      .find({ projetoId })
      .sort({ order: 1, _id: 1 })
      .exec();
  }

  async updateStep(
    stepId: string,
    dto: UpdateTarefaStepDto,
  ): Promise<TarefaStep> {
    const step = await this.tarefaStepModel
      .findByIdAndUpdate(stepId, dto, { new: true })
      .exec();

    if (!step) {
      throw new NotFoundException('Step não encontrado.');
    }

    return step;
  }

  async deleteStep(stepId: string): Promise<void> {
    const tarefasUsandoStep = await this.tarefaModel
      .exists({ step: stepId })
      .exec();

    if (tarefasUsandoStep) {
      throw new BadRequestException(
        'Não é possível excluir este step porque existem tarefas vinculadas a ele.',
      );
    }

    const result = await this.tarefaStepModel.findByIdAndDelete(stepId).exec();
    if (!result) {
      throw new NotFoundException('Step não encontrado.');
    }
  }

  // ------------------ TYPES ------------------

  async createType(dto: CreateTarefaTypeDto): Promise<TarefaType> {
    const projeto = await this.projetoModel.findById(dto.projetoId).exec();
    if (!projeto) {
      throw new BadRequestException('Projeto não encontrado para o type.');
    }

    const type = new this.tarefaTypeModel(dto);
    return type.save();
  }

  async getTypesByProjeto(projetoId: string): Promise<TarefaType[]> {
    return this.tarefaTypeModel
      .find({ projetoId })
      .sort({ name: 1, _id: 1 })
      .exec();
  }

  async updateType(
    typeId: string,
    dto: UpdateTarefaTypeDto,
  ): Promise<TarefaType> {
    const type = await this.tarefaTypeModel
      .findByIdAndUpdate(typeId, dto, { new: true })
      .exec();

    if (!type) {
      throw new NotFoundException('Type não encontrado.');
    }

    return type;
  }

  async deleteType(typeId: string): Promise<void> {
    const tarefasUsandoType = await this.tarefaModel
      .exists({ type: typeId })
      .exec();

    if (tarefasUsandoType) {
      throw new BadRequestException(
        'Não é possível excluir este type porque existem tarefas vinculadas a ele.',
      );
    }

    const result = await this.tarefaTypeModel.findByIdAndDelete(typeId).exec();
    if (!result) {
      throw new NotFoundException('Type não encontrado.');
    }
  }
}
