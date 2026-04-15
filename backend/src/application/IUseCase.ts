/**
 * Interfaz para el resultado de un caso de uso
 */
export interface IUseCase<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse>
}
