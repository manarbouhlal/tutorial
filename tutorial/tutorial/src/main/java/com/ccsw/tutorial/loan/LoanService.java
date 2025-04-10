package com.ccsw.tutorial.loan;

import com.ccsw.tutorial.loan.model.Loan;
import com.ccsw.tutorial.loan.model.LoanDto;
import com.ccsw.tutorial.loan.model.LoanSearchDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface LoanService {
    /**
     * Obtiene un préstamo por su ID
     *
     * @param id Identificador del préstamo
     * @return Préstamo
     */
    Loan get(Long id);

    /**
     * Busca préstamos paginados con los criterios de búsqueda
     *
     * @param dto Criterios de búsqueda
     * @return Página de préstamos
     */
    Page<Loan> findPage(LoanSearchDto dto);

    /**
     * Obtiene todos los préstamos
     *
     * @return Lista de préstamos
     */
    List<Loan> findAll();

    /**
     * Guarda o actualiza un préstamo
     *
     * @param id Identificador del préstamo (null para nuevo)
     * @param dto Datos del préstamo
     */
    void save(Long id, LoanDto dto) throws Exception;

    /**
     * Elimina un préstamo
     *
     * @param id Identificador del préstamo
     */
    void delete(Long id);
}