import 'package:flutter/material.dart';
import 'package:workhub_mb/theme/app_theme.dart';

class JobCard extends StatelessWidget {
  final String title;
  final String company;
  final String location;
  final String type;
  final String salary;
  final String description;
  final int? jobId;

  const JobCard({
    super.key,
    required this.title,
    required this.company,
    required this.location,
    required this.type,
    required this.salary,
    required this.description,
    this.jobId,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: jobId != null
          ? () {
              Navigator.pushNamed(
                context,
                '/job-detail',
                arguments: {'jobId': jobId},
              );
            }
          : null,
      child: Card(
        elevation: 6,
        shadowColor: AppTheme.primaryColor.withOpacity(0.12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.business, color: AppTheme.primaryColor, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                        Text(
                          company,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500, color: AppTheme.primaryColor),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.location_on, color: AppTheme.primaryColor, size: 18),
                  const SizedBox(width: 4),
                  Text(location, style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(width: 16),
                  Icon(Icons.work, color: AppTheme.primaryColor, size: 18),
                  const SizedBox(width: 4),
                  Text(type, style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    salary,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                  ),
                  if (jobId != null)
                    Icon(Icons.bookmark_border, color: AppTheme.primaryColor, size: 26),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}