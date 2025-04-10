import { Pageable } from 'src/app/core/model/page/Pageable';

export interface LoanSearchDto {
  pageable: Pageable;
  clientId?: number;
  gameId?: number;
  date?: string; // ¡ya formateada en el servicio si hace falta!
}

  