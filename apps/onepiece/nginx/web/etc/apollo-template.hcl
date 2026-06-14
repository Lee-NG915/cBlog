log_level = "warn"

wait {
  min = "5s"
  max = "10s"
}

template {
  source      = "/opt/nginx/etc/templates/default.conf.tmpl"
  destination = "/etc/nginx/conf.d/default.conf"

  error_on_missing_key = true
  perms  = 0644
  backup = true
}
