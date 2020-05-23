package demo.msa.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

  private JdbcTemplate jdbcTemplate;

  @Autowired
  public ProductService(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<String> getProductList() {
    return jdbcTemplate.queryForList(
        "SELECT name FROM product",
        String.class
    );
  }
}
