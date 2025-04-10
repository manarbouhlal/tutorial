package com.ccsw.tutorial.loan;

import com.ccsw.tutorial.loan.model.Loan;
import com.ccsw.tutorial.loan.model.LoanDto;
import com.ccsw.tutorial.loan.model.LoanSearchDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author ccsw
 *
 */
@Tag(name = "Loan", description = "API for Loan Management")
@RequestMapping(value = "/loan")
@RestController
@CrossOrigin(origins = "*")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @Autowired
    private ModelMapper mapper;

    /**
     * Método para recuperar un listado paginado de {@link Loan} con filtros opcionales
     *
     * @param dto dto de búsqueda
     * @param gameId ID del juego (opcional)
     * @param clientId ID del cliente (opcional)
     * @param date Fecha para filtrar préstamos (opcional)
     * @return {@link Page} de {@link LoanDto}
     */
    @Operation(summary = "Find Page", description = "Method that returns a filtered page of Loans")
    @RequestMapping(path = "", method = RequestMethod.POST)
    public Page<LoanDto> findPage(@RequestBody LoanSearchDto dto, @RequestParam(value = "gameId", required = false) Long gameId, @RequestParam(value = "clientId", required = false) Long clientId,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        // Si se reciben parámetros en la URL, actualizar el DTO con ellos
        if (gameId != null)
            dto.setGameId(gameId);
        if (clientId != null)
            dto.setClientId(clientId);
        if (date != null)
            dto.setDate(date);

        Page<Loan> page = this.loanService.findPage(dto);
        return new PageImpl<>(page.getContent().stream().map(e -> mapper.map(e, LoanDto.class)).collect(Collectors.toList()), page.getPageable(), page.getTotalElements());
    }

    /**
     * Método para recuperar una lista completa de {@link Loan}
     *
     * @return {@link List} de {@link LoanDto}
     */
    @Operation(summary = "Find All", description = "Method that returns all Loans")
    @RequestMapping(path = "", method = RequestMethod.GET)
    public List<LoanDto> findAll() {
        return this.loanService.findAll().stream().map(e -> mapper.map(e, LoanDto.class)).collect(Collectors.toList());
    }

    /**
     * Método para crear un nuevo {@link Loan}
     *
     * @param dto datos del préstamo a crear
     * @return mensaje de éxito o error
     */
    @Operation(summary = "Create", description = "Method that creates a new Loan")
    @RequestMapping(path = "", method = RequestMethod.PUT)
    public ResponseEntity<Map<String, String>> save(@RequestBody LoanDto dto) {
        try {
            this.loanService.save(null, dto);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Préstamo creado correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Método para eliminar un {@link Loan}
     *
     * @param id PK de la entidad
     */
    @Operation(summary = "Delete", description = "Method that deletes a Loan")
    @RequestMapping(path = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable("id") Long id) throws Exception {
        this.loanService.delete(id);
    }
}