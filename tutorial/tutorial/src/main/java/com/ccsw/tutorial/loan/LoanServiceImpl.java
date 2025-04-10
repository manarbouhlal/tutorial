package com.ccsw.tutorial.loan;

import com.ccsw.tutorial.client.ClientService;
import com.ccsw.tutorial.game.GameService;
import com.ccsw.tutorial.loan.model.Loan;
import com.ccsw.tutorial.loan.model.LoanDto;
import com.ccsw.tutorial.loan.model.LoanSearchDto;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LoanServiceImpl implements LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private GameService gameService;

    @Autowired
    private ClientService clientService;

    @Override
    public Loan get(Long id) {
        return this.loanRepository.findById(id).orElse(null);
    }

    @Override
    public List<Loan> findAll() {
        return (List<Loan>) this.loanRepository.findAll();
    }

    @Override
    public Page<Loan> findPage(LoanSearchDto dto) {
        Specification<Loan> spec = LoanSpecification.createSpecification(dto);
        return this.loanRepository.findAll(spec, dto.getPageable().getPageable());
    }

    @Override
    @Transactional
    public void save(Long id, LoanDto dto) throws Exception {
        validateLoan(id, dto);

        Loan loan = new Loan();
        if (id != null) {
            loan = this.get(id);
        }

        BeanUtils.copyProperties(dto, loan, "id", "game", "client");
        loan.setGame(gameService.get(dto.getGame().getId()));
        loan.setClient(clientService.get(dto.getClient().getId()));

        this.loanRepository.save(loan);
    }

    private void validateLoan(Long id, LoanDto dto) throws Exception {
        // Validar que la fecha de fin no sea anterior a la fecha de inicio
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new Exception("La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        // Validar que el periodo de préstamo no sea mayor a 14 días
        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
        if (days > 14) {
            throw new Exception("El periodo de préstamo no puede ser mayor a 14 días");
        }

        validateGameAvailability(id, dto);
        validateClientLoanLimit(id, dto);
    }

    private void validateGameAvailability(Long id, LoanDto dto) throws Exception {
        List<Loan> loans = loanRepository.findByGameId(dto.getGame().getId());

        for (Loan loan : loans) {
            // Ignorar el mismo préstamo en caso de actualización
            if (id != null && loan.getId().equals(id))
                continue;

            // Verificar si hay solapamiento de fechas
            boolean noOverlap = dto.getEndDate().isBefore(loan.getStartDate()) || dto.getStartDate().isAfter(loan.getEndDate());

            if (!noOverlap) {
                throw new Exception("El juego ya está prestado a otro cliente en el periodo seleccionado");
            }
        }
    }

    private void validateClientLoanLimit(Long id, LoanDto dto) throws Exception {
        List<Loan> loans = loanRepository.findByClientId(dto.getClient().getId());

        LocalDate currentDate = dto.getStartDate();
        while (!currentDate.isAfter(dto.getEndDate())) {
            final LocalDate checkDate = currentDate;

            // Contar préstamos activos en esta fecha
            long activeLoanCount = loans.stream().filter(loan -> !(id != null && loan.getId().equals(id))).filter(loan -> !loan.getStartDate().isAfter(checkDate) && !loan.getEndDate().isBefore(checkDate)).count();

            if (activeLoanCount >= 2) {
                throw new Exception("El cliente ya tiene 2 juegos prestados en la fecha " + checkDate);
            }

            currentDate = currentDate.plusDays(1);
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        this.loanRepository.deleteById(id);
    }
}