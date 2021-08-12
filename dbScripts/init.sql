CREATE TABLE `translation-api`.users (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('owner','admin','translator') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `translation-api`.users (createdAt,updatedAt,email,password,`role`) VALUES 
('2021-08-12 12:02:08.149306','2021-08-12 12:02:08.149306','admin01@test.com','$2a$10$W.U.Pg097H67Ii4nRfu1MOC9hkaRYATrd4q0/DMlQEeQbCpLvC106','owner')
,('2021-08-12 12:21:15.918335','2021-08-12 12:21:15.918335','translator01@test.com','$2a$10$Qb0EVas/dYzSbqEMlS7nZeYhJF5hL8fdt.saLuPPHTKzig60/Yp9a','translator')
,('2021-08-12 12:32:45.034314','2021-08-12 12:32:45.034314','translator02@test.com','$2a$10$9nhyfox6.gOmEhHs6Ls.OOR1J8TWOZNaCnCyUAu4lqlZAGfdgDqPe','translator')
,('2021-08-12 12:32:52.768527','2021-08-12 12:32:52.768527','translator03@test.com','$2a$10$8Gzgbj8Juf8/XnSiRt9UKOgG//MAJPdSI31t7wLcDTm.1W4ggWkku','translator')
,('2021-08-12 12:32:55.399693','2021-08-12 12:32:55.399693','translator04@test.com','$2a$10$jyhZA4TTn0pVSVSVMeX2G.fZjddJMgNgNYmJ2BuF0ei8zP8qx8tRS','translator')
,('2021-08-12 12:32:58.131515','2021-08-12 12:32:58.131515','translator05@test.com','$2a$10$svIDnTRop3Cw.lW.w211keQwVxVYWOagxopg/Dng6FNNcKoDBJ5ym','translator')
,('2021-08-12 12:33:00.455052','2021-08-12 12:33:00.455052','translator06@test.com','$2a$10$nPMFWSI95Lfv0KwSwECCjO2CDjVXtd8ZYwMm1QvK2o5VANnt6fmle','translator')
;