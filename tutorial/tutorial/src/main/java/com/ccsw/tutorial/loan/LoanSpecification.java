package com.ccsw.tutorial.loan;

import com.ccsw.tutorial.common.criteria.SearchCriteria;
import com.ccsw.tutorial.loan.model.Loan;
import com.ccsw.tutorial.loan.model.LoanSearchDto;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class LoanSpecification implements Specification<Loan> {
    private static final long serialVersionUID = 1L;
    private final SearchCriteria criteria;

    public LoanSpecification(SearchCriteria criteria) {
        this.criteria = criteria;
    }

    @Override
    public Predicate toPredicate(Root<Loan> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
        if (criteria.getOperation().equalsIgnoreCase(":") && criteria.getValue() != null) {

            if (criteria.getKey().equals("dateActive") && criteria.getValue() instanceof LocalDate date) {
                return builder.and(builder.lessThanOrEqualTo(root.get("startDate"), date), builder.greaterThanOrEqualTo(root.get("endDate"), date));
            }

            Path<?> path = getPath(root);
            if (path.getJavaType() == String.class) {
                return builder.like((Path<String>) path, "%" + criteria.getValue() + "%");
            } else {
                return builder.equal(path, criteria.getValue());
            }
        }
        return null;
    }

    private Path<?> getPath(Root<Loan> root) {
        String key = criteria.getKey();
        String[] split = key.split("[.]", 0);
        Path<?> expression = root.get(split[0]);
        for (int i = 1; i < split.length; i++) {
            expression = expression.get(split[i]);
        }
        return expression;
    }

    public static Specification<Loan> createSpecification(LoanSearchDto dto) {
        Specification<Loan> spec = Specification.where(null);

        if (dto.getGameId() != null) {
            spec = spec.and(new LoanSpecification(new SearchCriteria("game.id", ":", dto.getGameId())));
        }

        if (dto.getClientId() != null) {
            spec = spec.and(new LoanSpecification(new SearchCriteria("client.id", ":", dto.getClientId())));
        }

        if (dto.getDate() != null) {
            spec = spec.and(new LoanSpecification(new SearchCriteria("dateActive", ":", dto.getDate())));
        }

        return spec;
    }
}
